import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  Shield,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import {
  ExternalBlob,
  type Section,
  type Song,
  type SongId,
  Type,
} from "../backend";
import CategoryBadge from "../components/CategoryBadge";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddSong,
  useAllSongs,
  useDeleteSong,
  useIsAdmin,
  useUpdateSong,
} from "../hooks/useQueries";

const CATEGORY_OPTIONS: { value: Type; label: string }[] = [
  { value: Type.mass_songs, label: "Mass Songs" },
  { value: Type.marian_hymns, label: "Marian Hymns" },
  { value: Type.advent, label: "Advent" },
  { value: Type.lent, label: "Lent" },
  { value: Type.easter, label: "Easter" },
  { value: Type.general_devotion, label: "General Devotion" },
];

let sectionCounter = 0;
function newSectionId() {
  sectionCounter += 1;
  return `sec-${sectionCounter}`;
}

interface SongSection {
  _id: string;
  title: string;
  text: string;
}

interface SongFormData {
  title: string;
  composer: string;
  category: Type;
  sections: SongSection[];
  musicSheetFile: File | null;
}

const defaultForm = (): SongFormData => ({
  title: "",
  composer: "",
  category: Type.mass_songs,
  sections: [{ _id: newSectionId(), title: "Verse 1", text: "" }],
  musicSheetFile: null,
});

function formToSongInput(form: SongFormData) {
  const lyrics: Section[] = form.sections.map((s) => ({
    title: s.title,
    lyrics: s.text.split("\n").filter((l) => l.trim() !== ""),
  }));
  return {
    title: form.title,
    composer: form.composer,
    category: form.category,
    lyrics,
  };
}

interface AdminPageProps {
  navigate: (p: Page) => void;
}

export default function AdminPage({ navigate }: AdminPageProps) {
  const { login, clear, identity, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: songs, isLoading: loadingSongs } = useAllSongs();

  const [editingId, setEditingId] = useState<SongId | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SongFormData>(defaultForm());
  const [uploadProgress, setUploadProgress] = useState(0);

  const addSong = useAddSong();
  const updateSong = useUpdateSong();
  const deleteSong = useDeleteSong();

  const isLoggedIn = !!identity;

  function startEdit(song: Song) {
    setEditingId(song.id);
    setForm({
      title: song.title,
      composer: song.composer,
      category: song.category,
      sections: song.lyrics.map((s) => ({
        _id: newSectionId(),
        title: s.title,
        text: s.lyrics.join("\n"),
      })),
      musicSheetFile: null,
    });
    setShowForm(true);
  }

  function cancelForm() {
    setEditingId(null);
    setShowForm(false);
    setForm(defaultForm());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.composer.trim()) {
      toast.error("Title and composer are required");
      return;
    }

    try {
      let musicSheet: ExternalBlob | undefined;
      if (form.musicSheetFile) {
        const bytes = new Uint8Array(await form.musicSheetFile.arrayBuffer());
        musicSheet = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct),
        );
      }

      const input = { ...formToSongInput(form), musicSheet };

      if (editingId !== null) {
        await updateSong.mutateAsync({ id: editingId, input });
        toast.success("Song updated successfully");
      } else {
        await addSong.mutateAsync(input);
        toast.success("Song added successfully");
      }
      cancelForm();
    } catch {
      toast.error("Failed to save song. Please try again.");
    } finally {
      setUploadProgress(0);
    }
  }

  async function handleDelete(id: SongId) {
    try {
      await deleteSong.mutateAsync(id);
      toast.success("Song deleted");
    } catch {
      toast.error("Failed to delete song");
    }
  }

  function addSection() {
    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          _id: newSectionId(),
          title: `Verse ${prev.sections.length + 1}`,
          text: "",
        },
      ],
    }));
  }

  function removeSection(sectionId: string) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s._id !== sectionId),
    }));
  }

  function updateSection(
    sectionId: string,
    field: "title" | "text",
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s._id === sectionId ? { ...s, [field]: value } : s,
      ),
    }));
  }

  const isPending = addSong.isPending || updateSong.isPending;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        navigate={navigate}
        currentPage="admin"
        isAdmin={isLoggedIn && !!isAdmin}
      />

      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">
                Manage devotional songs and music sheets
              </p>
            </div>
          </div>

          {!isLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
              data-ocid="admin.panel"
            >
              <Shield className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">
                Admin Access Required
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Please log in to manage songs and music sheets.
              </p>
              <Button
                onClick={() => login()}
                disabled={isLoggingIn}
                className="gap-2 bg-primary hover:bg-burgundy-dark"
                data-ocid="admin.primary_button"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isLoggingIn ? "Logging in\u2026" : "Login"}
              </Button>
            </motion.div>
          ) : checkingAdmin ? (
            <div
              className="flex justify-center py-20"
              data-ocid="admin.loading_state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !isAdmin ? (
            <div
              className="flex flex-col items-center py-20 text-center"
              data-ocid="admin.error_state"
            >
              <p className="text-destructive font-semibold">
                You are not authorized as an admin.
              </p>
              <Button
                variant="outline"
                onClick={() => clear()}
                className="mt-4 gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <Badge
                  variant="outline"
                  className="text-xs gap-1 border-green-300 text-green-700 bg-green-50"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                  Logged in as Admin
                </Badge>
                <div className="flex items-center gap-2">
                  {!showForm && (
                    <Button
                      onClick={() => {
                        setShowForm(true);
                        setEditingId(null);
                        setForm(defaultForm());
                      }}
                      className="gap-2 bg-primary hover:bg-burgundy-dark"
                      size="sm"
                      data-ocid="admin.primary_button"
                    >
                      <Plus className="h-4 w-4" />
                      Add Song
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clear()}
                    className="gap-2 text-muted-foreground"
                    data-ocid="admin.secondary_button"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {showForm && (
                  <motion.form
                    key="song-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleSubmit}
                    className="mb-8 bg-card border border-border/70 rounded-lg p-6 shadow-card overflow-hidden"
                    data-ocid="admin.dialog"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-xl font-semibold">
                        {editingId !== null ? "Edit Song" : "Add New Song"}
                      </h2>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={cancelForm}
                        data-ocid="admin.close_button"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="song-title">Song Title *</Label>
                          <Input
                            id="song-title"
                            value={form.title}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, title: e.target.value }))
                            }
                            placeholder="e.g. Ave Maria"
                            required
                            data-ocid="admin.input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="song-composer">Composer *</Label>
                          <Input
                            id="song-composer"
                            value={form.composer}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                composer: e.target.value,
                              }))
                            }
                            placeholder="e.g. Franz Schubert"
                            required
                            data-ocid="admin.input"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={form.category}
                          onValueChange={(v) =>
                            setForm((p) => ({ ...p, category: v as Type }))
                          }
                        >
                          <SelectTrigger data-ocid="admin.select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORY_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Lyrics Sections</Label>
                        {form.sections.map((sec) => (
                          <div
                            key={sec._id}
                            className="border border-border/60 rounded-lg p-4 space-y-3 bg-muted/30"
                          >
                            <div className="flex items-center gap-2">
                              <Input
                                value={sec.title}
                                onChange={(e) =>
                                  updateSection(
                                    sec._id,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                placeholder="Section label (e.g. Verse 1, Chorus)"
                                className="flex-1 text-sm"
                                data-ocid="admin.input"
                              />
                              {form.sections.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSection(sec._id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <Textarea
                              value={sec.text}
                              onChange={(e) =>
                                updateSection(sec._id, "text", e.target.value)
                              }
                              placeholder="Enter lyrics, one line per row\u2026"
                              rows={4}
                              className="resize-none text-sm"
                              data-ocid="admin.textarea"
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addSection}
                          className="gap-2"
                          data-ocid="admin.secondary_button"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Section
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Music Sheet (PDF or Image)</Label>
                        <label
                          className="flex items-center gap-3 border border-dashed border-border rounded-lg px-4 py-3 cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-colors"
                          data-ocid="admin.dropzone"
                        >
                          <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {form.musicSheetFile
                              ? form.musicSheetFile.name
                              : "Click to upload music sheet (PDF, PNG, JPG)"}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="sr-only"
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                musicSheetFile: e.target.files?.[0] ?? null,
                              }))
                            }
                          />
                        </label>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <p className="text-xs text-muted-foreground">
                            Uploading\u2026 {uploadProgress}%
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelForm}
                          data-ocid="admin.cancel_button"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isPending}
                          className="gap-2 bg-primary hover:bg-burgundy-dark"
                          data-ocid="admin.submit_button"
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          {isPending
                            ? "Saving\u2026"
                            : editingId !== null
                              ? "Update Song"
                              : "Add Song"}
                        </Button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <Separator className="mb-6" />

              <h2 className="font-display text-xl font-semibold mb-4">
                Songs ({songs?.length ?? 0})
              </h2>

              {loadingSongs ? (
                <div className="space-y-3" data-ocid="admin.loading_state">
                  {["r1", "r2", "r3", "r4"].map((k) => (
                    <div
                      key={k}
                      className="h-16 rounded-lg bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : !songs?.length ? (
                <div
                  className="py-12 text-center text-muted-foreground"
                  data-ocid="admin.empty_state"
                >
                  No songs yet. Add the first one!
                </div>
              ) : (
                <div className="space-y-2" data-ocid="admin.list">
                  {songs.map((song, idx) => (
                    <AdminSongRow
                      key={song.id.toString()}
                      song={song}
                      index={idx + 1}
                      onEdit={() => startEdit(song)}
                      onDelete={() => handleDelete(song.id)}
                      isDeleting={deleteSong.isPending}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function AdminSongRow({
  song,
  index,
  onEdit,
  onDelete,
  isDeleting,
}: {
  song: Song;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border border-border/60 rounded-lg bg-card overflow-hidden shadow-card"
      data-ocid={`admin.item.${index}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 flex items-center gap-3 text-left"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-sm truncate">
              {song.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {song.composer}
            </p>
          </div>
          <CategoryBadge category={song.category} />
        </button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={onEdit}
            data-ocid={`admin.edit_button.${index}`}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                data-ocid={`admin.delete_button.${index}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="admin.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Song</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &ldquo;{song.title}&rdquo;?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="admin.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                  data-ocid="admin.confirm_button"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground overflow-hidden"
          >
            <p>{song.lyrics[0]?.lyrics[0] ?? "\u2014"}</p>
            <p className="mt-1 text-xs">{song.lyrics.length} section(s)</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

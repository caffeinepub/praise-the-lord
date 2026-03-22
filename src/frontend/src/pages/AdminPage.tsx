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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Music,
  Newspaper,
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
  type NewsPost,
  type NewsPostId,
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
  useAddDownloadItem,
  useAddNewsPost,
  useAddSong,
  useAllDownloadItems,
  useAllNewsPosts,
  useAllSongs,
  useDeleteDownloadItem,
  useDeleteNewsPost,
  useDeleteSong,
  useIsAdmin,
  useUpdateNewsPost,
  useUpdateSong,
} from "../hooks/useQueries";

const ADMIN_CODE = "JD@PTL2026";

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

  // Security gate state
  const [codeInput, setCodeInput] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [showCode, setShowCode] = useState(false);

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (codeInput === ADMIN_CODE) {
      setCodeVerified(true);
    } else {
      toast.error("Incorrect security code");
      setCodeInput("");
    }
  }

  const isLoggedIn = !!identity;

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
                Manage devotional songs, news, and downloads
              </p>
            </div>
          </div>

          {/* Step 1: Security Code Gate */}
          {!codeVerified ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16"
              data-ocid="admin.panel"
            >
              <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-semibold mb-1">
                    Secure Admin Access
                  </h2>
                  <p className="text-sm text-muted-foreground text-center">
                    Enter your secret admin code to proceed
                  </p>
                </div>
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-code">Admin Security Code</Label>
                    <div className="relative">
                      <Input
                        id="admin-code"
                        type={showCode ? "text" : "password"}
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        placeholder="Enter your admin code…"
                        autoComplete="off"
                        className="pr-10"
                        data-ocid="admin.input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCode((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        data-ocid="admin.toggle"
                      >
                        {showCode ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2 bg-primary hover:bg-primary/90"
                    disabled={!codeInput}
                    data-ocid="admin.submit_button"
                  >
                    <Lock className="h-4 w-4" />
                    Verify Code
                  </Button>
                </form>
              </div>
            </motion.div>
          ) : !isLoggedIn ? (
            /* Step 2: Internet Identity login */
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
                Code verified! Please log in to access the admin panel.
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
            <AdminTabs onLogout={clear} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function AdminTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <Badge
          variant="outline"
          className="text-xs gap-1 border-green-300 text-green-700 bg-green-50"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
          Logged in as Admin
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="gap-2 text-muted-foreground"
          data-ocid="admin.secondary_button"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>

      <Tabs defaultValue="songs" data-ocid="admin.tab">
        <TabsList className="mb-6">
          <TabsTrigger value="songs" className="gap-2" data-ocid="admin.tab">
            <Music className="h-4 w-4" />
            Songs
          </TabsTrigger>
          <TabsTrigger value="news" className="gap-2" data-ocid="admin.tab">
            <Newspaper className="h-4 w-4" />
            News
          </TabsTrigger>
          <TabsTrigger
            value="downloads"
            className="gap-2"
            data-ocid="admin.tab"
          >
            <Download className="h-4 w-4" />
            Downloads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="songs">
          <SongsTab />
        </TabsContent>
        <TabsContent value="news">
          <NewsTab />
        </TabsContent>
        <TabsContent value="downloads">
          <DownloadsTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

// ─── Songs Tab ───────────────────────────────────────────────────────────────

function SongsTab() {
  const { data: songs, isLoading: loadingSongs } = useAllSongs();
  const [editingId, setEditingId] = useState<SongId | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SongFormData>(defaultForm());
  const [uploadProgress, setUploadProgress] = useState(0);

  const addSong = useAddSong();
  const updateSong = useUpdateSong();
  const deleteSong = useDeleteSong();

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold">
          Songs ({songs?.length ?? 0})
        </h2>
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
                          updateSection(sec._id, "title", e.target.value)
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

      {loadingSongs ? (
        <div className="space-y-3" data-ocid="admin.loading_state">
          {["r1", "r2", "r3", "r4"].map((k) => (
            <div key={k} className="h-16 rounded-lg bg-muted animate-pulse" />
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

// ─── News Tab ────────────────────────────────────────────────────────────────

function NewsTab() {
  const { data: posts, isLoading } = useAllNewsPosts();
  const addPost = useAddNewsPost();
  const updatePost = useUpdateNewsPost();
  const deletePost = useDeleteNewsPost();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<NewsPostId | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function openAdd() {
    setEditingId(null);
    setTitle("");
    setBody("");
    setShowForm(true);
  }

  function openEdit(post: NewsPost) {
    setEditingId(post.id);
    setTitle(post.title);
    setBody(post.body);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setTitle("");
    setBody("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    try {
      if (editingId !== null) {
        await updatePost.mutateAsync({ id: editingId, input: { title, body } });
        toast.success("News post updated");
      } else {
        await addPost.mutateAsync({ title, body });
        toast.success("News post added");
      }
      cancelForm();
    } catch {
      toast.error("Failed to save news post");
    }
  }

  async function handleDelete(id: NewsPostId) {
    try {
      await deletePost.mutateAsync(id);
      toast.success("News post deleted");
    } catch {
      toast.error("Failed to delete news post");
    }
  }

  const isPending = addPost.isPending || updatePost.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold">
          News Posts ({posts?.length ?? 0})
        </h2>
        {!showForm && (
          <Button
            onClick={openAdd}
            className="gap-2 bg-primary hover:bg-burgundy-dark"
            size="sm"
            data-ocid="admin.primary_button"
          >
            <Plus className="h-4 w-4" />
            Add News
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="news-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-8 bg-card border border-border/70 rounded-lg p-6 shadow-card overflow-hidden"
            data-ocid="admin.dialog"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">
                {editingId !== null ? "Edit News Post" : "Add News Post"}
              </h3>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="news-title">Title *</Label>
                <Input
                  id="news-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="News title…"
                  required
                  data-ocid="admin.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-body">Body *</Label>
                <Textarea
                  id="news-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write the news content here…"
                  rows={5}
                  className="resize-none"
                  data-ocid="admin.textarea"
                />
              </div>
              <div className="flex justify-end gap-2">
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
                      ? "Update Post"
                      : "Add Post"}
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <Separator className="mb-6" />

      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.loading_state">
          {["n1", "n2", "n3"].map((k) => (
            <div key={k} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : !posts?.length ? (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="admin.empty_state"
        >
          No news posts yet. Add the first one!
        </div>
      ) : (
        <div className="space-y-3" data-ocid="admin.list">
          {posts.map((post, idx) => (
            <div
              key={post.id.toString()}
              className="border border-border/60 rounded-lg bg-card p-4 shadow-card"
              data-ocid={`admin.item.${idx + 1}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(
                      Number(post.createdAt / 1_000_000n),
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {post.body}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => openEdit(post)}
                    data-ocid={`admin.edit_button.${idx + 1}`}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        data-ocid={`admin.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="admin.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete News Post</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &ldquo;{post.title}
                          &rdquo;? This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="admin.cancel_button">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(post.id)}
                          disabled={deletePost.isPending}
                          className="bg-destructive hover:bg-destructive/90"
                          data-ocid="admin.confirm_button"
                        >
                          {deletePost.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Downloads Tab ────────────────────────────────────────────────────────────

function DownloadsTab() {
  const { data: items, isLoading } = useAllDownloadItems();
  const addItem = useAddDownloadItem();
  const deleteItem = useDeleteDownloadItem();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  function cancelForm() {
    setShowForm(false);
    setTitle("");
    setDescription("");
    setFile(null);
    setUploadProgress(0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !file) {
      toast.error("Title and file are required");
      return;
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const fileBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );
      await addItem.mutateAsync({ title, description, fileBlob });
      toast.success("Download item added");
      cancelForm();
    } catch {
      toast.error("Failed to add download item");
    } finally {
      setUploadProgress(0);
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteItem.mutateAsync(id);
      toast.success("Download item deleted");
    } catch {
      toast.error("Failed to delete download item");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold">
          Downloads ({items?.length ?? 0})
        </h2>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 bg-primary hover:bg-burgundy-dark"
            size="sm"
            data-ocid="admin.primary_button"
          >
            <Plus className="h-4 w-4" />
            Add Download
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="download-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-8 bg-card border border-border/70 rounded-lg p-6 shadow-card overflow-hidden"
            data-ocid="admin.dialog"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">
                Add Download Item
              </h3>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dl-title">Title *</Label>
                <Input
                  id="dl-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Advent Music Sheet Pack"
                  required
                  data-ocid="admin.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dl-desc">Description</Label>
                <Textarea
                  id="dl-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this download contains…"
                  rows={3}
                  className="resize-none"
                  data-ocid="admin.textarea"
                />
              </div>
              <div className="space-y-2">
                <Label>File *</Label>
                <label
                  className="flex items-center gap-3 border border-dashed border-border rounded-lg px-4 py-3 cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-colors"
                  data-ocid="admin.dropzone"
                >
                  <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {file
                      ? file.name
                      : "Click to upload any file (PDF, MP3, ZIP, etc.)"}
                  </span>
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <p className="text-xs text-muted-foreground">
                    Uploading… {uploadProgress}%
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
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
                  disabled={addItem.isPending}
                  className="gap-2 bg-primary hover:bg-burgundy-dark"
                  data-ocid="admin.submit_button"
                >
                  {addItem.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {addItem.isPending ? "Uploading…" : "Add Download"}
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <Separator className="mb-6" />

      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.loading_state">
          {["d1", "d2"].map((k) => (
            <div key={k} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : !items?.length ? (
        <div
          className="py-12 text-center text-muted-foreground"
          data-ocid="admin.empty_state"
        >
          No download items yet. Add the first one!
        </div>
      ) : (
        <div className="space-y-2" data-ocid="admin.list">
          {items.map((item, idx) => (
            <div
              key={item.id.toString()}
              className="border border-border/60 rounded-lg bg-card px-4 py-3 flex items-center gap-3 shadow-card"
              data-ocid={`admin.item.${idx + 1}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm truncate">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                    data-ocid={`admin.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-ocid="admin.dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Download Item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &ldquo;{item.title}
                      &rdquo;? This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="admin.cancel_button">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteItem.isPending}
                      className="bg-destructive hover:bg-destructive/90"
                      data-ocid="admin.confirm_button"
                    >
                      {deleteItem.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

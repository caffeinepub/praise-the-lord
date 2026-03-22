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
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Loader2,
  LogIn,
  Music,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { ExternalBlob, type Section, Type } from "../backend";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddSong, useIsAdmin } from "../hooks/useQueries";

const CATEGORY_OPTIONS: { value: Type; label: string }[] = [
  { value: Type.mass_songs, label: "Mass Songs" },
  { value: Type.marian_hymns, label: "Marian Hymns" },
  { value: Type.advent, label: "Advent" },
  { value: Type.lent, label: "Lent" },
  { value: Type.easter, label: "Easter" },
  { value: Type.general_devotion, label: "General Devotion" },
];

let sectionCounter = 100;
function newId() {
  sectionCounter += 1;
  return `upload-sec-${sectionCounter}`;
}

interface SongSection {
  _id: string;
  title: string;
  text: string;
}

interface UploadForm {
  title: string;
  composer: string;
  category: Type;
  sections: SongSection[];
  file: File | null;
}

const defaultForm = (): UploadForm => ({
  title: "",
  composer: "",
  category: Type.mass_songs,
  sections: [{ _id: newId(), title: "Verse 1", text: "" }],
  file: null,
});

interface UploadPageProps {
  navigate: (p: Page) => void;
}

export default function UploadPage({ navigate }: UploadPageProps) {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const addSong = useAddSong();

  const [form, setForm] = useState<UploadForm>(defaultForm());
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const isLoggedIn = !!identity;

  function addSection() {
    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { _id: newId(), title: `Verse ${prev.sections.length + 1}`, text: "" },
      ],
    }));
  }

  function removeSection(id: string) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s._id !== id),
    }));
  }

  function updateSection(id: string, field: "title" | "text", value: string) {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s._id === id ? { ...s, [field]: value } : s,
      ),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.composer.trim()) {
      toast.error("Title and composer are required");
      return;
    }

    try {
      let musicSheet: ExternalBlob | undefined;
      if (form.file) {
        const bytes = new Uint8Array(await form.file.arrayBuffer());
        musicSheet = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct),
        );
      }

      const lyrics: Section[] = form.sections.map((s) => ({
        title: s.title,
        lyrics: s.text.split("\n").filter((l) => l.trim() !== ""),
      }));

      await addSong.mutateAsync({
        title: form.title,
        composer: form.composer,
        category: form.category,
        lyrics,
        musicSheet,
      });

      setSubmitted(true);
    } catch {
      toast.error("Failed to upload. Please try again.");
    } finally {
      setUploadProgress(0);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header navigate={navigate} currentPage="upload" isAdmin={!!isAdmin} />

      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <Upload className="h-5 w-5 text-emerald-700" />
            </div>
            <h1 className="font-display text-3xl font-bold">Upload a Song</h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Share hymns and music sheets with the community
          </p>

          {!isLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl bg-card"
              data-ocid="upload.panel"
            >
              <Music className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">
                Login to Upload
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xs text-sm">
                You need to be logged in to contribute songs and music sheets.
              </p>
              <Button
                onClick={() => login()}
                disabled={isLoggingIn}
                className="gap-2 bg-primary hover:bg-burgundy-dark"
                data-ocid="upload.primary_button"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isLoggingIn ? "Logging in\u2026" : "Login to Upload"}
              </Button>
            </motion.div>
          ) : submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
              data-ocid="upload.success_state"
            >
              <CheckCircle2 className="h-14 w-14 text-emerald-600 mb-4" />
              <h2 className="font-display text-2xl font-bold mb-2">
                Song Uploaded!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your song has been added to the collection.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setForm(defaultForm());
                    setSubmitted(false);
                  }}
                  data-ocid="upload.secondary_button"
                >
                  Upload Another
                </Button>
                <Button
                  onClick={() => navigate({ name: "songs" })}
                  className="bg-primary hover:bg-burgundy-dark"
                  data-ocid="upload.primary_button"
                >
                  Browse Songs
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6 bg-card border border-border/70 rounded-xl p-6 shadow-card"
              data-ocid="upload.dialog"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="upload-title">Song Title *</Label>
                  <Input
                    id="upload-title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g. Amazing Grace"
                    required
                    data-ocid="upload.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload-composer">Composer *</Label>
                  <Input
                    id="upload-composer"
                    value={form.composer}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, composer: e.target.value }))
                    }
                    placeholder="e.g. John Newton"
                    required
                    data-ocid="upload.input"
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
                  <SelectTrigger data-ocid="upload.select">
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
                <Label>Lyrics</Label>
                {form.sections.map((sec) => (
                  <div
                    key={sec._id}
                    className="border border-border/60 rounded-lg p-4 space-y-3 bg-muted/20"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={sec.title}
                        onChange={(e) =>
                          updateSection(sec._id, "title", e.target.value)
                        }
                        placeholder="Section (e.g. Verse 1, Chorus)"
                        className="flex-1 text-sm"
                        data-ocid="upload.input"
                      />
                      {form.sections.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSection(sec._id)}
                          className="text-destructive"
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
                      data-ocid="upload.textarea"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSection}
                  className="gap-2"
                  data-ocid="upload.secondary_button"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Section
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Music Sheet (PDF or Image) — Optional</Label>
                <label
                  className="flex items-center gap-3 border border-dashed border-border rounded-lg px-4 py-4 cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-colors"
                  data-ocid="upload.dropzone"
                >
                  <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      {form.file
                        ? form.file.name
                        : "Click to upload music sheet"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      PDF, PNG, or JPG accepted
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="sr-only"
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        file: e.target.files?.[0] ?? null,
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

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ name: "songs" })}
                  data-ocid="upload.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addSong.isPending}
                  className="gap-2 bg-primary hover:bg-burgundy-dark"
                  data-ocid="upload.submit_button"
                >
                  {addSong.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {addSong.isPending ? "Uploading\u2026" : "Submit Song"}
                </Button>
              </div>
            </motion.form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

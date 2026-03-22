import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Download, Eye, Music2 } from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";
import type { SongId } from "../backend";
import CategoryBadge from "../components/CategoryBadge";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useIsAdmin, useSong } from "../hooks/useQueries";

interface SongDetailPageProps {
  id: SongId;
  navigate: (p: Page) => void;
}

export default function SongDetailPage({ id, navigate }: SongDetailPageProps) {
  const { data: song, isLoading, isError } = useSong(id);
  const { data: isAdmin } = useIsAdmin();

  return (
    <div className="min-h-screen flex flex-col">
      <Header navigate={navigate} currentPage="song" isAdmin={!!isAdmin} />

      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ name: "songs" })}
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
            data-ocid="song.link"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Songs
          </Button>

          {isLoading && (
            <div className="space-y-4" data-ocid="song.loading_state">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-6 w-24 mt-2" />
              <Separator className="my-6" />
              {["s1", "s2", "s3", "s4"].map((k) => (
                <Skeleton key={k} className="h-24 w-full" />
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-20" data-ocid="song.error_state">
              <p className="text-destructive">
                Song not found or failed to load.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate({ name: "songs" })}
                className="mt-4"
              >
                Return to Songs
              </Button>
            </div>
          )}

          {song && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Music2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
                      {song.title}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {song.composer}
                    </p>
                  </div>
                </div>
                <CategoryBadge category={song.category} />
              </div>

              <Separator className="my-6" />

              <div className="space-y-8">
                {song.lyrics.map((section) => (
                  <motion.div
                    key={section.title || "section"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-card border border-border/60 rounded-lg px-6 py-5 shadow-card"
                  >
                    {section.title && (
                      <h3 className="font-display text-sm font-semibold text-gold uppercase tracking-widest mb-4">
                        {section.title}
                      </h3>
                    )}
                    <div className="space-y-1.5">
                      {section.lyrics.map((line) => (
                        <p
                          key={line || "empty-line"}
                          className={`font-display text-lg leading-relaxed ${
                            line.trim() === "" ? "h-4" : "text-foreground"
                          }`}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {song.musicSheet ? (
                <div className="mt-10 p-6 bg-parchment border border-gold/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="h-5 w-5 text-gold" />
                    <h3 className="font-display text-lg font-semibold">
                      Music Sheet
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="gap-2 border-gold/40 hover:border-gold/70 hover:bg-gold/5"
                      data-ocid="song.secondary_button"
                    >
                      <a
                        href={song.musicSheet.getDirectURL()}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Eye className="h-4 w-4" />
                        View Sheet
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="default"
                      className="gap-2 bg-primary hover:bg-burgundy-dark"
                      data-ocid="song.primary_button"
                    >
                      <a href={song.musicSheet.getDirectURL()} download>
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-10 p-5 border border-dashed border-border rounded-lg text-center text-muted-foreground text-sm">
                  <BookOpen className="h-6 w-6 mx-auto mb-2 opacity-40" />
                  No music sheet attached for this song
                </div>
              )}

              {isAdmin && (
                <div className="mt-8 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ name: "admin" })}
                    className="gap-2"
                    data-ocid="song.edit_button"
                  >
                    Manage in Admin Panel
                  </Button>
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

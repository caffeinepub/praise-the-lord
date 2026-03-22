import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileDown } from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAllDownloadItems, useIsAdmin } from "../hooks/useQueries";

interface DownloadsPageProps {
  navigate: (p: Page) => void;
}

export default function DownloadsPage({ navigate }: DownloadsPageProps) {
  const { data: isAdmin } = useIsAdmin();
  const { data: items, isLoading } = useAllDownloadItems();

  return (
    <div className="min-h-screen flex flex-col">
      <Header navigate={navigate} currentPage="downloads" isAdmin={!!isAdmin} />

      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Downloads</h1>
                <p className="text-sm text-muted-foreground">
                  Music sheets, prayer books, and devotional resources
                </p>
              </div>
            </div>

            {isLoading ? (
              <div
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                data-ocid="downloads.loading_state"
              >
                {["a", "b", "c"].map((k) => (
                  <div
                    key={k}
                    className="h-40 rounded-xl bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : !items?.length ? (
              <div
                className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground"
                data-ocid="downloads.empty_state"
              >
                <FileDown className="h-12 w-12 opacity-30 mb-4" />
                <p className="font-display text-lg font-semibold">
                  No downloads available yet
                </p>
                <p className="text-sm mt-1">
                  Check back soon for music sheets and resources.
                </p>
              </div>
            ) : (
              <div
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                data-ocid="downloads.list"
              >
                {items.map((item, i) => (
                  <motion.div
                    key={item.id.toString()}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    data-ocid={`downloads.item.${i + 1}`}
                  >
                    <Card className="h-full flex flex-col border-border/70 bg-card hover:shadow-card transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="font-display text-base leading-snug line-clamp-2">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between gap-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {item.description}
                        </p>
                        <a
                          href={item.fileBlob.getDirectURL()}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-ocid="downloads.primary_button"
                        >
                          <Button
                            className="w-full gap-2 bg-primary hover:bg-primary/90"
                            size="sm"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

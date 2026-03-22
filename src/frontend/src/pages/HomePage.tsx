import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  HandHeart,
  Heart,
  Music2,
  Newspaper,
  Phone,
  Search,
  Shield,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Page } from "../App";
import { type Song, Type } from "../backend";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAllNewsPosts, useAllSongs, useIsAdmin } from "../hooks/useQueries";
import { SAMPLE_PRAYERS } from "./PrayersPage";

const SAMPLE_SONGS: Song[] = [
  {
    id: BigInt(0),
    title: "Hosanna (Praise Is Rising)",
    composer: "Paul Baloche & Brenton Brown",
    category: Type.mass_songs,
    lyrics: [
      {
        title: "Verse 1",
        lyrics: ["Praise is rising, eyes are turning to You"],
      },
    ],
    createdAt: BigInt(0),
    updatedAt: BigInt(0),
  },
  {
    id: BigInt(1),
    title: "Ave Maria",
    composer: "Franz Schubert",
    category: Type.marian_hymns,
    lyrics: [{ title: "Verse 1", lyrics: ["Ave Maria, gratia plena"] }],
    createdAt: BigInt(0),
    updatedAt: BigInt(0),
  },
  {
    id: BigInt(2),
    title: "O Come, O Come Emmanuel",
    composer: "Traditional Plainchant",
    category: Type.advent,
    lyrics: [{ title: "Verse 1", lyrics: ["O come, O come Emmanuel"] }],
    createdAt: BigInt(0),
    updatedAt: BigInt(0),
  },
];

const QUICK_LINKS = [
  {
    label: "Browse Songs",
    page: { name: "songs" } as Page,
    icon: Music2,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Prayers",
    page: { name: "prayers" } as Page,
    icon: HandHeart,
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  {
    label: "Upload",
    page: { name: "upload" } as Page,
    icon: Upload,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    label: "Donate",
    page: { name: "donate" } as Page,
    icon: Heart,
    color: "text-mtn-dark",
    bg: "bg-mtn/20",
  },
  {
    label: "Support",
    page: { name: "support" } as Page,
    icon: Phone,
    color: "text-purple-700",
    bg: "bg-purple-50",
  },
];

interface HomePageProps {
  navigate: (p: Page) => void;
}

export default function HomePage({ navigate }: HomePageProps) {
  const [search, setSearch] = useState("");
  const { data: songs } = useAllSongs();
  const { data: isAdmin } = useIsAdmin();
  const { data: newsPosts } = useAllNewsPosts();

  const displaySongs =
    songs && songs.length > 0 ? songs.slice(0, 6) : SAMPLE_SONGS;

  // Combined search across songs and prayers
  const q = search.toLowerCase().trim();
  const songResults = q
    ? displaySongs.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.composer.toLowerCase().includes(q),
      )
    : displaySongs;
  const prayerResults = q
    ? SAMPLE_PRAYERS.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q),
      )
    : [];

  const noResults = q && songResults.length === 0 && prayerResults.length === 0;

  // Latest 3 news posts (most recent first)
  const latestNews = newsPosts
    ? [...newsPosts]
        .sort((a, b) => Number(b.createdAt - a.createdAt))
        .slice(0, 3)
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header navigate={navigate} currentPage="home" isAdmin={!!isAdmin} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="h-64 sm:h-80 bg-cover bg-center relative"
            style={{
              backgroundImage:
                "url('/assets/generated/hero-praise-the-lord.dim_1200x500.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/30 to-background/80" />
            <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <p className="text-gold font-body text-sm font-semibold tracking-[0.2em] uppercase mb-2">
                  Catholic Devotion
                </p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
                  Praise The Lord
                </h1>
                <p className="mt-3 text-white/85 font-body text-sm sm:text-base max-w-lg mx-auto drop-shadow">
                  Sacred hymns, Mass songs, prayers and music sheets for the
                  glory of God
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Admin Panel Entry */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-end mb-4"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ name: "admin" })}
              className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
              data-ocid="home.admin_button"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin Panel
            </Button>
          </motion.div>

          {/* Global Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative max-w-2xl mx-auto mb-8"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search songs or prayers\u2026"
              className="pl-10 h-12 bg-card border-border shadow-card text-base"
              data-ocid="home.search_input"
            />
          </motion.div>

          {/* Search Results */}
          {q && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-10"
            >
              {noResults ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="home.empty_state"
                >
                  <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p>No songs or prayers found for &ldquo;{search}&rdquo;</p>
                </div>
              ) : (
                <>
                  {songResults.length > 0 && (
                    <div className="mb-6">
                      <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                        <Music2 className="h-4 w-4 text-gold" />
                        Songs ({songResults.length})
                      </h2>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {songResults.map((song, i) => (
                          <button
                            key={song.id.toString()}
                            type="button"
                            onClick={() =>
                              navigate({ name: "song", id: song.id })
                            }
                            className="text-left p-4 bg-card border border-border/70 rounded-lg hover:shadow-card transition-shadow"
                            data-ocid={`home.item.${i + 1}`}
                          >
                            <p className="font-display font-semibold text-sm line-clamp-1">
                              {song.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {song.composer}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {prayerResults.length > 0 && (
                    <div>
                      <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                        <HandHeart className="h-4 w-4 text-blue-600" />
                        Prayers ({prayerResults.length})
                      </h2>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {prayerResults.map((prayer, i) => (
                          <button
                            key={prayer.id}
                            type="button"
                            onClick={() => navigate({ name: "prayers" })}
                            className="text-left p-4 bg-card border border-border/70 rounded-lg hover:shadow-card transition-shadow"
                            data-ocid={`home.item.${i + 1}`}
                          >
                            <p className="font-display font-semibold text-sm">
                              {prayer.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">
                              {prayer.excerpt}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Quick Links */}
          {!q && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-10"
              >
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => navigate(link.page)}
                    className="flex flex-col items-center gap-2 p-3 bg-card border border-border/60 rounded-lg hover:shadow-card transition-all group"
                    data-ocid="home.link"
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${link.bg}`}
                    >
                      <link.icon className={`h-4 w-4 ${link.color}`} />
                    </div>
                    <span className={`text-xs font-medium ${link.color}`}>
                      {link.label}
                    </span>
                  </button>
                ))}
              </motion.div>

              {/* Latest News Section */}
              {latestNews.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Newspaper className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-xl font-bold">
                      Latest News
                    </h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {latestNews.map((post, i) => (
                      <motion.div
                        key={post.id.toString()}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.07 * i }}
                        data-ocid={`home.item.${i + 1}`}
                      >
                        <div className="p-4 bg-card border border-primary/20 rounded-lg h-full">
                          <p className="font-display font-bold text-sm leading-snug mb-1">
                            {post.title}
                          </p>
                          <p className="text-xs text-muted-foreground mb-2">
                            {new Date(
                              Number(post.createdAt / 1_000_000n),
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.body}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Songs */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-bold">
                    Recent Songs
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ name: "songs" })}
                    className="text-primary text-sm"
                    data-ocid="home.link"
                  >
                    View all →
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {displaySongs.slice(0, 3).map((song, i) => (
                    <motion.div
                      key={song.id.toString()}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <Card
                        className="group cursor-pointer hover:shadow-missal transition-all duration-200 border-border/70 bg-card"
                        onClick={() => navigate({ name: "song", id: song.id })}
                        data-ocid={`home.item.${i + 4}`}
                      >
                        <CardHeader className="pb-2">
                          <h3 className="font-display text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {song.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {song.composer}
                          </p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground italic font-display line-clamp-2">
                            &ldquo;{song.lyrics[0]?.lyrics[0] ?? ""}&rdquo;
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Prayers preview */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-bold">Prayers</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ name: "prayers" })}
                    className="text-primary text-sm"
                    data-ocid="home.link"
                  >
                    View all →
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {SAMPLE_PRAYERS.slice(0, 3).map((prayer, i) => (
                    <button
                      key={prayer.id}
                      type="button"
                      onClick={() => navigate({ name: "prayers" })}
                      className="text-left p-4 bg-card border border-blue-100 rounded-lg hover:shadow-card transition-shadow"
                      data-ocid={`home.item.${i + 7}`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <HandHeart className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                        <p className="font-display font-semibold text-sm">
                          {prayer.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground italic line-clamp-2">
                        {prayer.excerpt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

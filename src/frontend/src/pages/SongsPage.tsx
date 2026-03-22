import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Music2, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Page } from "../App";
import { type Song, Type } from "../backend";
import CategoryBadge from "../components/CategoryBadge";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAllSongs, useIsAdmin } from "../hooks/useQueries";

const SAMPLE_SONGS: Song[] = [
  {
    id: BigInt(0),
    title: "Hosanna (Praise Is Rising)",
    composer: "Paul Baloche & Brenton Brown",
    category: Type.mass_songs,
    lyrics: [
      {
        title: "Verse 1",
        lyrics: ["Praise is rising, eyes are turning to You", "We turn to You"],
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
    lyrics: [
      {
        title: "Verse 1",
        lyrics: ["Ave Maria, gratia plena", "Dominus tecum, benedicta tu"],
      },
    ],
    createdAt: BigInt(0),
    updatedAt: BigInt(0),
  },
  {
    id: BigInt(2),
    title: "O Come, O Come Emmanuel",
    composer: "Traditional Plainchant",
    category: Type.advent,
    lyrics: [
      {
        title: "Verse 1",
        lyrics: ["O come, O come Emmanuel", "And ransom captive Israel"],
      },
    ],
    createdAt: BigInt(0),
    updatedAt: BigInt(0),
  },
  {
    id: BigInt(3),
    title: "Were You There",
    composer: "Traditional Spiritual",
    category: Type.lent,
    lyrics: [
      {
        title: "Verse 1",
        lyrics: ["Were you there when they crucified my Lord?"],
      },
    ],
    createdAt: BigInt(0),
    updatedAt: BigInt(0),
  },
  {
    id: BigInt(4),
    title: "Alleluia, Alleluia",
    composer: "Fintan O'Carroll",
    category: Type.easter,
    lyrics: [
      {
        title: "Chorus",
        lyrics: ["Alleluia, alleluia, give thanks to the risen Lord"],
      },
    ],
    createdAt: BigInt(0),
    updatedAt: BigInt(0),
  },
  {
    id: BigInt(5),
    title: "On Eagle's Wings",
    composer: "Michael Joncas",
    category: Type.general_devotion,
    lyrics: [
      {
        title: "Chorus",
        lyrics: ["And He will raise you up on eagle's wings"],
      },
    ],
    createdAt: BigInt(0),
    updatedAt: BigInt(0),
  },
];

const CATEGORIES: { value: Type | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: Type.mass_songs, label: "Mass Songs" },
  { value: Type.marian_hymns, label: "Marian Hymns" },
  { value: Type.advent, label: "Advent" },
  { value: Type.lent, label: "Lent" },
  { value: Type.easter, label: "Easter" },
  { value: Type.general_devotion, label: "General Devotion" },
];

interface SongsPageProps {
  navigate: (p: Page) => void;
}

export default function SongsPage({ navigate }: SongsPageProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Type | "all">("all");

  const { data: songs, isLoading } = useAllSongs();
  const { data: isAdmin } = useIsAdmin();

  const displaySongs = songs && songs.length > 0 ? songs : SAMPLE_SONGS;

  const filteredSongs = useMemo(() => {
    let list = displaySongs;
    if (category !== "all") list = list.filter((s) => s.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.composer.toLowerCase().includes(q),
      );
    }
    return list;
  }, [displaySongs, category, search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header navigate={navigate} currentPage="songs" isAdmin={!!isAdmin} />

      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <h1 className="font-display text-3xl font-bold mb-2">
            Songs & Hymns
          </h1>
          <p className="text-muted-foreground mb-8">
            Browse our full collection of Catholic devotional songs
          </p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative max-w-xl mb-6"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search songs or prayers\u2026"
              className="pl-10 h-11 bg-card border-border shadow-card"
              data-ocid="songs.search_input"
            />
          </motion.div>

          <Tabs
            value={category}
            onValueChange={(v) => setCategory(v as Type | "all")}
            className="mb-8"
          >
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1 justify-start overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-ocid="songs.filter.tab"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              data-ocid="songs.loading_state"
            >
              {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
                <Skeleton key={k} className="h-44 rounded-lg" />
              ))}
            </div>
          ) : filteredSongs.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 text-center"
              data-ocid="songs.empty_state"
            >
              <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-display text-xl font-semibold text-muted-foreground">
                No songs found
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search or category
              </p>
            </div>
          ) : (
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {filteredSongs.map((song, i) => (
                <motion.div
                  key={song.id.toString()}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4 },
                    },
                  }}
                >
                  <Card
                    className="group cursor-pointer hover:shadow-missal transition-all duration-200 border-border/70 bg-card h-full"
                    onClick={() => navigate({ name: "song", id: song.id })}
                    data-ocid={`songs.item.${i + 1}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {song.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-0.5 truncate">
                            {song.composer}
                          </p>
                        </div>
                        <Music2 className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CategoryBadge category={song.category} />
                      {song.lyrics[0]?.lyrics[0] && (
                        <p className="mt-3 text-sm text-muted-foreground italic font-display leading-relaxed line-clamp-2">
                          &ldquo;{song.lyrics[0].lyrics[0]}&rdquo;
                        </p>
                      )}
                      {song.musicSheet && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-gold font-medium">
                          <BookOpen className="h-3.5 w-3.5" />
                          Music sheet available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { HandHeart, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Page } from "../App";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useIsAdmin } from "../hooks/useQueries";

export interface Prayer {
  id: string;
  title: string;
  excerpt: string;
  body: string[];
}

export const SAMPLE_PRAYERS: Prayer[] = [
  {
    id: "our-father",
    title: "The Our Father",
    excerpt: "Our Father, who art in heaven, hallowed be Thy name...",
    body: [
      "Our Father, who art in heaven,",
      "hallowed be Thy name;",
      "Thy kingdom come,",
      "Thy will be done on earth as it is in heaven.",
      "",
      "Give us this day our daily bread,",
      "and forgive us our trespasses,",
      "as we forgive those who trespass against us;",
      "and lead us not into temptation,",
      "but deliver us from evil.",
      "",
      "Amen.",
    ],
  },
  {
    id: "hail-mary",
    title: "Hail Mary",
    excerpt: "Hail Mary, full of grace, the Lord is with thee...",
    body: [
      "Hail Mary, full of grace,",
      "the Lord is with thee.",
      "Blessed art thou amongst women,",
      "and blessed is the fruit of thy womb, Jesus.",
      "",
      "Holy Mary, Mother of God,",
      "pray for us sinners,",
      "now and at the hour of our death.",
      "",
      "Amen.",
    ],
  },
  {
    id: "glory-be",
    title: "Glory Be (Doxology)",
    excerpt:
      "Glory be to the Father, and to the Son, and to the Holy Spirit...",
    body: [
      "Glory be to the Father,",
      "and to the Son,",
      "and to the Holy Spirit.",
      "",
      "As it was in the beginning,",
      "is now, and ever shall be,",
      "world without end.",
      "",
      "Amen.",
    ],
  },
  {
    id: "apostles-creed",
    title: "The Apostles\u2019 Creed",
    excerpt:
      "I believe in God, the Father almighty, Creator of heaven and earth...",
    body: [
      "I believe in God,",
      "the Father almighty,",
      "Creator of heaven and earth,",
      "and in Jesus Christ, his only Son, our Lord,",
      "",
      "who was conceived by the Holy Spirit,",
      "born of the Virgin Mary,",
      "suffered under Pontius Pilate,",
      "was crucified, died and was buried;",
      "he descended into hell;",
      "on the third day he rose again from the dead;",
      "",
      "he ascended into heaven,",
      "and is seated at the right hand of God the Father almighty;",
      "from there he will come to judge the living and the dead.",
      "",
      "I believe in the Holy Spirit,",
      "the holy catholic Church,",
      "the communion of saints,",
      "the forgiveness of sins,",
      "the resurrection of the body,",
      "and life everlasting.",
      "",
      "Amen.",
    ],
  },
  {
    id: "act-of-contrition",
    title: "Act of Contrition",
    excerpt: "O my God, I am heartily sorry for having offended Thee...",
    body: [
      "O my God,",
      "I am heartily sorry for having offended Thee,",
      "and I detest all my sins",
      "because of Thy just punishments,",
      "but most of all because they offend Thee, my God,",
      "who art all-good and deserving of all my love.",
      "",
      "I firmly resolve,",
      "with the help of Thy grace,",
      "to sin no more",
      "and to avoid the near occasions of sin.",
      "",
      "Amen.",
    ],
  },
  {
    id: "memorare",
    title: "The Memorare",
    excerpt:
      "Remember, O most gracious Virgin Mary, that never was it known...",
    body: [
      "Remember, O most gracious Virgin Mary,",
      "that never was it known",
      "that anyone who fled to thy protection,",
      "implored thy help, or sought thy intercession",
      "was left unaided.",
      "",
      "Inspired with this confidence,",
      "I fly to thee, O Virgin of virgins, my Mother;",
      "to thee do I come, before thee I stand,",
      "sinful and sorrowful.",
      "",
      "O Mother of the Word Incarnate,",
      "despise not my petitions,",
      "but in thy mercy hear and answer me.",
      "",
      "Amen.",
    ],
  },
];

interface PrayersPageProps {
  navigate: (p: Page) => void;
}

export default function PrayersPage({ navigate }: PrayersPageProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: isAdmin } = useIsAdmin();

  const filtered = search.trim()
    ? SAMPLE_PRAYERS.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(search.toLowerCase()),
      )
    : SAMPLE_PRAYERS;

  return (
    <div className="min-h-screen flex flex-col">
      <Header navigate={navigate} currentPage="prayers" isAdmin={!!isAdmin} />

      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <HandHeart className="h-5 w-5 text-blue-700" />
            </div>
            <h1 className="font-display text-3xl font-bold">Prayers</h1>
          </div>
          <p className="text-muted-foreground mb-8 ml-13">
            Traditional Catholic prayers for daily devotion
          </p>

          <div className="relative mb-8">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search songs or prayers\u2026"
              className="pl-10 h-11 bg-card border-border shadow-card"
              data-ocid="prayers.search_input"
            />
          </div>

          {filtered.length === 0 ? (
            <div
              className="py-16 text-center text-muted-foreground"
              data-ocid="prayers.empty_state"
            >
              <HandHeart className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No prayers found for &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            <div className="space-y-3" data-ocid="prayers.list">
              {filtered.map((prayer, i) => (
                <motion.div
                  key={prayer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border/60 rounded-lg overflow-hidden shadow-card"
                  data-ocid={`prayers.item.${i + 1}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) =>
                        prev === prayer.id ? null : prayer.id,
                      )
                    }
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                    data-ocid="prayers.toggle"
                  >
                    <div>
                      <h3 className="font-display text-lg font-semibold">
                        {prayer.title}
                      </h3>
                      <p className="text-sm text-muted-foreground italic mt-0.5 line-clamp-1">
                        {prayer.excerpt}
                      </p>
                    </div>
                    <div
                      className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-transform ${
                        expanded === prayer.id
                          ? "rotate-45 bg-primary/10"
                          : "bg-muted"
                      }`}
                    >
                      <span className="text-sm font-bold leading-none text-muted-foreground">
                        +
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expanded === prayer.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 border-t border-border/40 bg-parchment/50">
                          {prayer.body.map((line) => (
                            <p
                              key={line || "empty"}
                              className={`font-display text-base leading-relaxed ${
                                line === "" ? "h-3" : "text-foreground"
                              }`}
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

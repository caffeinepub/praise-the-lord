import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Heart, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useIsAdmin } from "../hooks/useQueries";

const USSD_CODE = "*182*8*1*1177059#";

const STEPS = [
  {
    step: "1",
    label: "Open your phone dialer",
    detail: "Use the default phone app on your MTN line",
  },
  {
    step: "2",
    label: "Dial the USSD code",
    detail: `Type exactly: ${USSD_CODE}`,
  },
  {
    step: "3",
    label: "Press Call / Send",
    detail: "A menu will appear on your screen",
  },
  {
    step: "4",
    label: "Follow the prompts",
    detail: "Confirm the donation amount as instructed",
  },
  {
    step: "5",
    label: "Transaction complete!",
    detail: "You will receive an SMS confirmation",
  },
];

interface DonatePageProps {
  navigate: (p: Page) => void;
}

export default function DonatePage({ navigate }: DonatePageProps) {
  const { data: isAdmin } = useIsAdmin();
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(USSD_CODE);
      setCopied(true);
      toast.success("USSD code copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Could not copy. Please copy manually.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header navigate={navigate} currentPage="donate" isAdmin={!!isAdmin} />

      <main className="flex-1">
        <div className="container mx-auto max-w-xl px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mtn/30">
                <Heart className="h-5 w-5 text-mtn-dark" />
              </div>
              <h1 className="font-display text-3xl font-bold">
                Support Our Mission
              </h1>
            </div>
            <p className="text-muted-foreground mb-10">
              Your generous donation helps us grow this sacred collection of
              Catholic devotional music.
            </p>

            {/* MTN MoMo Card */}
            <div
              className="rounded-2xl overflow-hidden shadow-missal mb-8"
              data-ocid="donate.card"
            >
              {/* Header band */}
              <div className="bg-mtn px-6 py-4 flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-foreground/80" />
                <div>
                  <p className="font-bold text-foreground text-sm tracking-wide uppercase">
                    MTN Mobile Money
                  </p>
                  <p className="text-xs text-foreground/70">Uganda</p>
                </div>
              </div>

              <div className="bg-card px-6 py-6">
                <p className="text-sm text-muted-foreground mb-3 text-center">
                  Dial this USSD code on your MTN line to donate:
                </p>

                {/* USSD Code Display */}
                <div className="flex items-center gap-3 bg-mtn/15 border-2 border-mtn rounded-xl px-5 py-4 mb-4">
                  <span className="font-display text-2xl font-bold tracking-wider text-foreground flex-1 text-center">
                    {USSD_CODE}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyCode}
                    className="gap-2 flex-shrink-0 border-mtn-dark/40 hover:bg-mtn/20"
                    data-ocid="donate.primary_button"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Tap <strong>Copy</strong> then open your phone dialer and
                  paste
                </p>
              </div>
            </div>

            {/* Step-by-step */}
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-card mb-8">
              <h2 className="font-display text-lg font-semibold mb-5">
                How to Donate — Step by Step
              </h2>
              <ol className="space-y-4">
                {STEPS.map((s) => (
                  <li
                    key={s.step}
                    className="flex items-start gap-4"
                    data-ocid={`donate.item.${s.step}`}
                  >
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-mtn flex items-center justify-center text-sm font-bold text-foreground/80">
                      {s.step}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{s.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Thank you note */}
            <div className="text-center py-6 border border-gold/30 rounded-xl bg-parchment">
              <Heart className="h-7 w-7 text-gold mx-auto mb-3" />
              <p className="font-display text-lg font-semibold mb-1">
                God bless you!
              </p>
              <p className="text-sm text-muted-foreground">
                Every contribution, big or small, helps us serve the faithful.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

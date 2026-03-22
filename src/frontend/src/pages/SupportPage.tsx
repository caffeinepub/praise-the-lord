import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useIsAdmin } from "../hooks/useQueries";

const PHONE = "0786010369";

interface SupportPageProps {
  navigate: (p: Page) => void;
}

export default function SupportPage({ navigate }: SupportPageProps) {
  const { data: isAdmin } = useIsAdmin();

  return (
    <div className="min-h-screen flex flex-col">
      <Header navigate={navigate} currentPage="support" isAdmin={!!isAdmin} />

      <main className="flex-1">
        <div className="container mx-auto max-w-xl px-4 py-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                <Phone className="h-5 w-5 text-purple-700" />
              </div>
              <h1 className="font-display text-3xl font-bold">Support</h1>
            </div>

            {/* Contact Card */}
            <div
              className="bg-card border border-border/60 rounded-2xl p-8 shadow-missal text-center"
              data-ocid="support.card"
            >
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-9 w-9 text-primary" />
                </div>
              </div>

              <h2 className="font-display text-2xl font-bold mb-2">
                Get in Touch
              </h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Call or WhatsApp us for support with songs, uploads, or any
                other questions.
              </p>

              {/* Phone Number Display */}
              <div className="bg-parchment border border-gold/30 rounded-xl px-6 py-5 mb-8">
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                  Phone / WhatsApp
                </p>
                <p className="font-display text-4xl font-bold text-primary tracking-wide">
                  {PHONE}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  className="gap-2 bg-primary hover:bg-burgundy-dark flex-1"
                  data-ocid="support.primary_button"
                >
                  <a href={`tel:${PHONE}`}>
                    <Phone className="h-4 w-4" />
                    Call Us
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="gap-2 border-green-400 text-green-700 hover:bg-green-50 flex-1"
                  data-ocid="support.secondary_button"
                >
                  <a
                    href={`https://wa.me/${PHONE.replace(/^0/, "256")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Us
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-8 p-5 bg-card border border-border/50 rounded-xl text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">
                Available Hours
              </p>
              <p>Monday – Friday: 8:00 AM – 6:00 PM</p>
              <p>Saturday: 9:00 AM – 2:00 PM</p>
              <p className="mt-2 italic">
                We aim to respond to all messages within 24 hours.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

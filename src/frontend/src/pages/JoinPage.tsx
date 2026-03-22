import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  BookOpen,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Loader2,
  MapPin,
  MessageSquare,
  Music2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Page } from "../App";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useIsAdmin } from "../hooks/useQueries";

const HOW_OPTIONS = [
  { value: "friend", label: "A Friend" },
  { value: "social", label: "Social Media" },
  { value: "parish", label: "My Parish" },
  { value: "other", label: "Other" },
];

const BENEFITS = [
  {
    icon: Music2,
    title: "Upload Songs & Music Sheets",
    desc: "Contribute hymns and sheet music to the community collection.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: CalendarDays,
    title: "Devotion Updates",
    desc: "Receive updates on liturgical seasons, Mass schedules and community events.",
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  {
    icon: HeartHandshake,
    title: "Fellowship Support",
    desc: "Connect with fellow Catholics who share your devotion and faith.",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    icon: BookOpen,
    title: "Event Participation",
    desc: "Join community prayer gatherings, choir practice and devotional retreats.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
];

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  parish: string;
  dob: string;
  howHeard: string;
  whyJoin: string;
  agreed: boolean;
}

const emptyForm = (): FormState => ({
  fullName: "",
  email: "",
  phone: "",
  parish: "",
  dob: "",
  howHeard: "",
  whyJoin: "",
  agreed: false,
});

interface JoinPageProps {
  navigate: (p: Page) => void;
}

export default function JoinPage({ navigate }: JoinPageProps) {
  const { data: isAdmin } = useIsAdmin();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      next.email = "A valid email address is required.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    if (!form.parish.trim()) next.parish = "Location / Parish is required.";
    if (!form.agreed)
      next.agreed = "You must agree to the community guidelines.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Simulate a short async delay (no backend needed)
    await new Promise((res) => setTimeout(res, 900));
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header navigate={navigate} currentPage="join" isAdmin={!!isAdmin} />

      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-12">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h1 className="font-display text-4xl font-bold mb-3">
              Become a Member
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Join our community of faith and devotion. Together we praise, pray
              and grow in the love of God.
            </p>
          </motion.div>

          {/* Success state */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border/60 rounded-2xl p-10 text-center shadow-missal"
              data-ocid="join.success_state"
            >
              <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-5" />
              <h2 className="font-display text-2xl font-bold mb-3">
                Application Received!
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-2 max-w-sm mx-auto">
                Thank you for applying! We will contact you at your phone number
                or email soon.
              </p>
              <p className="font-display text-lg font-semibold text-gold mb-8">
                God bless you! ✝️
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setForm(emptyForm());
                    setSubmitted(false);
                  }}
                  data-ocid="join.secondary_button"
                >
                  Submit Another
                </Button>
                <Button
                  onClick={() => navigate({ name: "home" })}
                  className="bg-primary hover:bg-burgundy-dark"
                  data-ocid="join.primary_button"
                >
                  Back to Home
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Application form */
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              onSubmit={handleSubmit}
              noValidate
              className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-card space-y-6"
              data-ocid="join.dialog"
            >
              <h2 className="font-display text-xl font-semibold border-b border-border/50 pb-4">
                Personal Information
              </h2>

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="join-name">Full Name *</Label>
                <Input
                  id="join-name"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="e.g. Maria Santos"
                  data-ocid="join.input"
                />
                {errors.fullName && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="join.error_state"
                  >
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email + Phone */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="join-email">Email Address *</Label>
                  <Input
                    id="join-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                    data-ocid="join.input"
                  />
                  {errors.email && (
                    <p
                      className="text-xs text-destructive mt-1"
                      data-ocid="join.error_state"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="join-phone">Phone Number *</Label>
                  <Input
                    id="join-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="e.g. 0786010369"
                    data-ocid="join.input"
                  />
                  {errors.phone && (
                    <p
                      className="text-xs text-destructive mt-1"
                      data-ocid="join.error_state"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Parish + DOB */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="join-parish">
                    <MapPin className="inline h-3.5 w-3.5 mr-1 opacity-60" />
                    Location / Parish *
                  </Label>
                  <Input
                    id="join-parish"
                    value={form.parish}
                    onChange={(e) => set("parish", e.target.value)}
                    placeholder="e.g. St. Mary's Parish, Kampala"
                    data-ocid="join.input"
                  />
                  {errors.parish && (
                    <p
                      className="text-xs text-destructive mt-1"
                      data-ocid="join.error_state"
                    >
                      {errors.parish}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="join-dob">Date of Birth</Label>
                  <Input
                    id="join-dob"
                    type="date"
                    value={form.dob}
                    onChange={(e) => set("dob", e.target.value)}
                    className="text-muted-foreground"
                    data-ocid="join.input"
                  />
                </div>
              </div>

              {/* How heard */}
              <div className="space-y-1.5">
                <Label>
                  <MessageSquare className="inline h-3.5 w-3.5 mr-1 opacity-60" />
                  How did you hear about us?
                </Label>
                <Select
                  value={form.howHeard}
                  onValueChange={(v) => set("howHeard", v)}
                >
                  <SelectTrigger data-ocid="join.select">
                    <SelectValue placeholder="Select an option\u2026" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOW_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Why join */}
              <div className="space-y-1.5">
                <Label htmlFor="join-why">Why do you want to join?</Label>
                <Textarea
                  id="join-why"
                  value={form.whyJoin}
                  onChange={(e) => set("whyJoin", e.target.value)}
                  placeholder="Share a little about your faith journey and what draws you to this community\u2026"
                  rows={4}
                  className="resize-none"
                  data-ocid="join.textarea"
                />
              </div>

              {/* Guidelines checkbox */}
              <div className="space-y-1.5">
                <div className="flex items-start gap-3 p-4 bg-parchment border border-gold/20 rounded-lg">
                  <Checkbox
                    id="join-agree"
                    checked={form.agreed}
                    onCheckedChange={(v) => set("agreed", v === true)}
                    className="mt-0.5 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    data-ocid="join.checkbox"
                  />
                  <Label
                    htmlFor="join-agree"
                    className="text-sm leading-relaxed cursor-pointer font-normal"
                  >
                    I agree to the{" "}
                    <span className="font-semibold text-primary">
                      community guidelines
                    </span>{" "}
                    and commit to participating respectfully and in the spirit
                    of Catholic devotion. *
                  </Label>
                </div>
                {errors.agreed && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="join.error_state"
                  >
                    {errors.agreed}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ name: "home" })}
                  data-ocid="join.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="gap-2 bg-primary hover:bg-burgundy-dark min-w-[140px]"
                  data-ocid="join.submit_button"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  {submitting ? "Submitting\u2026" : "Submit Application"}
                </Button>
              </div>
            </motion.form>
          )}

          {/* Benefits section */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-14"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold mb-2">
                Member Benefits
              </h2>
              <p className="text-muted-foreground text-sm">
                What you receive when you join our community
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-4 bg-card border border-border/60 rounded-xl p-5 shadow-card"
                  data-ocid={`join.item.${i + 1}`}
                >
                  <div
                    className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full ${b.bg}`}
                  >
                    <b.icon className={`h-5 w-5 ${b.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Closing verse */}
            <div className="mt-10 text-center py-6 border border-gold/30 rounded-xl bg-parchment">
              <p className="font-display italic text-lg text-foreground/80">
                &ldquo;For where two or three gather in my name, there am I with
                them.&rdquo;
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                — Matthew 18:20
              </p>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

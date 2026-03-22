import { Cross } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;
  return (
    <footer className="border-t border-border/60 bg-parchment py-8 mt-16">
      <div className="container mx-auto max-w-6xl px-4 flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Cross className="h-3.5 w-3.5 text-gold" />
          <span className="font-display italic">
            &ldquo;Sing to the Lord a new song&rdquo; — Psalm 96:1
          </span>
        </div>
        <p className="font-semibold text-foreground/80 tracking-wide">
          Made by <span className="text-gold">JUVENAL DUSINGIZIMANA</span>
        </p>
        <p>
          © {year}. Built with ❤️ using{" "}
          <a
            href={utm}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}

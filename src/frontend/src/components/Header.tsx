import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Cross,
  HandHeart,
  Heart,
  Menu,
  Music,
  Phone,
  Shield,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { Page } from "../App";

const NAV_ITEMS: { label: string; page: Page; icon: React.ReactNode }[] = [
  {
    label: "Home",
    page: { name: "home" },
    icon: <Cross className="h-3.5 w-3.5" />,
  },
  {
    label: "Songs",
    page: { name: "songs" },
    icon: <Music className="h-3.5 w-3.5" />,
  },
  {
    label: "Prayers",
    page: { name: "prayers" },
    icon: <HandHeart className="h-3.5 w-3.5" />,
  },
  {
    label: "Upload",
    page: { name: "upload" },
    icon: <Upload className="h-3.5 w-3.5" />,
  },
  {
    label: "Join Us",
    page: { name: "join" },
    icon: <Users className="h-3.5 w-3.5" />,
  },
  {
    label: "Support",
    page: { name: "support" },
    icon: <Phone className="h-3.5 w-3.5" />,
  },
  {
    label: "Donate",
    page: { name: "donate" },
    icon: <Heart className="h-3.5 w-3.5" />,
  },
];

interface HeaderProps {
  navigate: (p: Page) => void;
  currentPage?: string;
  isAdmin?: boolean;
}

export default function Header({
  navigate,
  currentPage,
  isAdmin,
}: HeaderProps) {
  const [open, setOpen] = useState(false);

  function handleNav(p: Page) {
    navigate(p);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate({ name: "home" })}
          className="flex items-center gap-2.5 group flex-shrink-0"
          data-ocid="nav.link"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Cross className="h-3.5 w-3.5" />
          </div>
          <div className="leading-none hidden sm:block">
            <span className="font-display text-base font-bold text-foreground">
              Praise
            </span>
            <span className="font-display text-base font-bold text-gold">
              {" "}
              The Lord
            </span>
          </div>
          <div className="leading-none sm:hidden">
            <span className="font-display text-base font-bold text-foreground">
              PTL
            </span>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.page.name;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.page)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                data-ocid="nav.link"
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate({ name: "admin" })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentPage === "admin"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
              data-ocid="nav.link"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </button>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                data-ocid="nav.toggle"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-card pt-10">
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = currentPage === item.page.name;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleNav(item.page)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors text-left ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                      data-ocid="nav.link"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleNav({ name: "admin" })}
                    className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors text-left"
                    data-ocid="nav.link"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

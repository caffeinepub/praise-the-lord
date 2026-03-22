import { Badge } from "@/components/ui/badge";
import { Type } from "../backend";

const categoryConfig: Record<Type, { label: string; className: string }> = {
  [Type.mass_songs]: {
    label: "Mass Songs",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  [Type.marian_hymns]: {
    label: "Marian Hymns",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  [Type.advent]: {
    label: "Advent",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  [Type.lent]: {
    label: "Lent",
    className: "bg-stone-100 text-stone-700 border-stone-300",
  },
  [Type.easter]: {
    label: "Easter",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  [Type.general_devotion]: {
    label: "General Devotion",
    className: "bg-green-50 text-green-700 border-green-200",
  },
};

export default function CategoryBadge({ category }: { category: Type }) {
  const config = categoryConfig[category] ?? { label: category, className: "" };
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

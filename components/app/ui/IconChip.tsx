import type { LucideIcon } from "lucide-react";

export function IconChip({
  icon: Icon,
  tone = "soft",
  size = "md",
}: {
  icon: LucideIcon;
  tone?: "soft" | "solid" | "dark";
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-8 w-8 [&>svg]:h-4 [&>svg]:w-4",
    md: "h-11 w-11 [&>svg]:h-5 [&>svg]:w-5",
    lg: "h-14 w-14 [&>svg]:h-6 [&>svg]:w-6",
  };
  const tones = {
    soft: "bg-brand-primary-soft text-brand-primary",
    solid:
      "bg-gradient-to-br from-brand-secondary to-brand-primary text-txt-inverse shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-2px_3px_rgba(0,0,0,0.15),0_4px_10px_rgba(32,83,68,0.25)]",
    dark: "bg-white/10 text-txt-inverse",
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[14px] ${sizes[size]} ${tones[tone]}`}
    >
      <Icon strokeWidth={2} />
    </span>
  );
}

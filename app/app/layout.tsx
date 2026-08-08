import { BottomNav } from "@/components/app/interna/BottomNav";

export default function AppInternaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-surface-base pb-24">
      {children}
      <BottomNav />
    </div>
  );
}

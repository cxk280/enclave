import { ResidencyBar } from "@/components/shell/residency-bar";
import { LeftNav } from "@/components/shell/left-nav";
import { MobileNav } from "@/components/shell/mobile-nav";

/** Authenticated app shell: sticky residency bar over a nav + content row. */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <ResidencyBar />
      <MobileNav />
      <div className="flex flex-1">
        <LeftNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import Footer from "@/features/layout/components/Footer";
import Header from "@/features/header/components/Header";

const LeftSidebar = dynamic(() => import("@/features/layout/components/LeftSidebar"), {
  loading: () => <aside className="sidebar-left sidebar-border-right hidden lg:block lg:min-w-[250px]" aria-hidden />,
});

const RightSidebar = dynamic(() => import("@/features/layout/components/RightSidebar"), {
  loading: () => <aside className="sidebar-border-left hidden lg:block lg:min-w-[340px]" aria-hidden />,
});

interface AppShellProps {
  children: ReactNode;
  contentClassName?: string;
}

export default function AppShell({ children, contentClassName }: AppShellProps) {
  return (
    <div className="bg-bg-white text-foreground">
      <Header />
      <div className="page-container">
        <div className="page-main-wrap">
          <main className="main-grid">
            <LeftSidebar />
            <section className={contentClassName ?? "content-section"}>{children}</section>
            <RightSidebar />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

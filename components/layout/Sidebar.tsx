"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import { useAppStore } from "@/store/appStore";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Brain,
  ShieldCheck,
  Building2,
  FlaskConical,
  HandshakeIcon,
  BarChart3,
  ClipboardList,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  FileText,
  Brain,
  ShieldCheck,
  Building2,
  FlaskConical,
  HandshakeIcon,
  BarChart3,
  ClipboardList,
  Trophy,
};

// Map nav item id → translation key
const navTranslationKey: Record<string, keyof typeof import('@/lib/i18n').translations.en.nav> = {
  dashboard:     'dashboard',
  submissions:   'submissions',
  'ai-evaluation': 'aiEvaluation',
  compliance:    'compliance',
  vendors:       'vendors',
  pilots:        'pilots',
  procurement:   'procurement',
  insights:      'insights',
  audit:         'audit',
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { navItems } = useRole();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setRole = useAppStore((s) => s.setRole);
  const { t, isRTL } = useTranslation();

  const handleSignOut = () => {
    setRole("admin");
    router.push("/");
  };

  return (
    <>
      <div
        onClick={toggleSidebar}
        className={cn(
          "fixed inset-0 bg-on-surface/20 backdrop-blur-[1px] z-20 lg:hidden transition-opacity duration-300",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed top-0 h-screen bg-surface-container-lowest shadow-ambient flex flex-col z-30 transition-all duration-300",
          // LTR: left side
          "left-0 w-64 -translate-x-full lg:translate-x-0",
          "lg:w-16",
          sidebarOpen ? "translate-x-0 lg:w-64" : "lg:w-16",
          // RTL: right side
          "rtl:left-auto rtl:right-0 rtl:translate-x-full rtl:lg:translate-x-0",
          isRTL && sidebarOpen && "rtl:translate-x-0",
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "border-b border-outline-variant/10 px-4 py-5",
            !sidebarOpen && "lg:justify-center lg:px-0",
          )}
        >
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="font-display text-headline-sm font-semibold tracking-[-0.02em] leading-none text-on-surface">
                {t.brand.name}
              </p>
              <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-[0.18em] text-on-surface-variant/80">
                {t.brand.platform}
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] ?? LayoutDashboard;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const label = navTranslationKey[item.id]
              ? t.nav[navTranslationKey[item.id]]
              : item.label;

            return (
              <Link
                key={item.id}
                href={item.href}
                title={!sidebarOpen ? label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                  !sidebarOpen &&
                    "lg:justify-center lg:px-0 lg:w-12 lg:mx-auto",
                )}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 1024)
                    toggleSidebar();
                }}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                {sidebarOpen && (
                  <span
                    className={cn(
                      "text-label-md font-medium truncate",
                      isActive && "font-semibold",
                    )}
                  >
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="px-2 pb-1 border-t border-outline-variant/10 pt-1">
          <Link
            href="/settings"
            title={!sidebarOpen ? t.nav.settings : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
              pathname === "/settings"
                ? "bg-primary/10 text-primary"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
              !sidebarOpen && "lg:justify-center lg:px-0 lg:w-12 lg:mx-auto",
            )}
          >
            <Settings className="w-[18px] h-[18px] flex-shrink-0" />
            {sidebarOpen && (
              <span className="text-label-md font-medium">{t.nav.settings}</span>
            )}
          </Link>
        </div>

        {/* Sign out */}
        <div className="p-2 border-t border-outline-variant/10">
          {sidebarOpen ? (
            <div className="px-2 py-1">
              <button
                onClick={handleSignOut}
                title={t.nav.signOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-colors"
              >
                <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="text-label-md font-medium">{t.nav.signOut}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              title={t.nav.signOut}
              className="w-12 h-10 rounded-lg flex items-center justify-center mx-auto text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "hidden lg:flex absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-container-lowest shadow-ambient-sm border border-outline-variant/20 items-center justify-center hover:bg-surface-container transition-colors duration-150",
            isRTL ? "-left-3" : "-right-3",
          )}
        >
          {isRTL ? (
            sidebarOpen ? (
              <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5 text-on-surface-variant" />
            )
          ) : sidebarOpen ? (
            <ChevronLeft className="w-3.5 h-3.5 text-on-surface-variant" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
          )}
        </button>
      </aside>
    </>
  );
}

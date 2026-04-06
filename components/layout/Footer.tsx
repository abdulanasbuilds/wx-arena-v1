import { cn } from "@/lib/utils/cn";

const LEGAL_LINKS: { label: string; href: string }[] = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Support", href: "/support" },
];

export function Footer() {
  return (
    <footer className={cn("bg-[#0d0d14] border-t border-[#1a1a2e]", "w-full")}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: copyright */}
          <p className="text-[#94a3b8] text-sm">
            &copy; 2025 WX ARENA. All rights reserved.
          </p>

          {/* Right: legal links */}
          <nav aria-label="Footer legal links">
            <ul className="flex items-center gap-5">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className={cn(
                      "text-sm text-[#94a3b8]",
                      "hover:text-[#f1f5f9] transition-colors duration-150",
                    )}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Tagline */}
        <p
          className={cn(
            "mt-4 text-center text-xs font-medium tracking-wide",
            "text-[#64748b]",
          )}
        >
          Skill-based gaming for Africa, SEA &amp; LATAM
        </p>
      </div>
    </footer>
  );
}

import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Layers, MessageSquare, User, Settings, Zap } from "lucide-react";

const navItems = [
  { href: "/deck", icon: Layers, label: "Discover" },
  { href: "/matches", icon: MessageSquare, label: "Messages" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location === item.href || 
            (item.href === "/matches" && location.startsWith("/chat"));
          
          return (
            <Link key={item.href} href={item.href}>
              <button
                className="relative flex flex-col items-center justify-center w-16 h-full group"
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <div className="relative">
                  <item.icon
                    className={`w-6 h-6 transition-colors duration-200 ${
                      isActive
                        ? "text-cyan-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
                
                <span
                  className={`text-xs mt-1 transition-colors duration-200 ${
                    isActive
                      ? "text-cyan-400"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 rounded-lg bg-cyan-500/10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TopHeader({ title, showLogo = true }: { title?: string; showLogo?: boolean }) {
  return (
    <header className="sticky top-0 z-30 glass border-b border-white/10">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {showLogo ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-slate-950" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight" data-testid="text-header-logo">TETHER</span>
          </div>
        ) : (
          <h1 className="text-lg font-semibold text-foreground" data-testid="text-page-title">{title}</h1>
        )}
        
        <Link href="/settings">
          <button 
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </Link>
      </div>
    </header>
  );
}

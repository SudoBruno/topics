import { CommandPalette } from "@/components/CommandPalette/CommandPalette";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { animations } from "@/lib/animations";
import { motion } from "framer-motion";
import {
  FileText,
  Home,
  LogOut,
  Monitor,
  Moon,
  Search,
  Sun,
  TreePine,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/tree", label: "Árvore", icon: TreePine },
  ];

  const handleThemeToggle = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  // Configurar atalhos de teclado
  useKeyboardShortcuts({
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true),
    onNewTopic: () => navigate("/topic/new"),
    onEscape: () => setIsCommandPaletteOpen(false),
  });

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        className="border-b border-border bg-card"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={animations.spring}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FileText className="h-6 w-6" />
              <h1 className="text-xl font-bold">Topics</h1>
            </motion.div>
            <motion.nav
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {navItems.map(({ path, label, icon: Icon }, index) => (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Button
                    variant={location.pathname === path ? "default" : "ghost"}
                    asChild
                    className="gap-2"
                  >
                    <Link to={path}>
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </motion.nav>
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="gap-2 text-muted-foreground"
                  title="Busca Global (Ctrl+K)"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Buscar</span>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleThemeToggle}
                  className="gap-2"
                  title={`Tema atual: ${
                    theme === "system"
                      ? "Sistema"
                      : theme === "light"
                      ? "Claro"
                      : "Escuro"
                  }`}
                >
                  {getThemeIcon()}
                  <span className="text-xs hidden sm:inline">
                    {theme === "system"
                      ? "Sistema"
                      : theme === "light"
                      ? "Claro"
                      : "Escuro"}
                  </span>
                  <span className="text-xs sm:hidden">
                    {theme === "system" ? "S" : theme === "light" ? "C" : "E"}
                  </span>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 text-muted-foreground hover:text-destructive"
                  title={`Sair (${user?.email})`}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {children}
      </motion.main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}

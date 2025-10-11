import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, TreePine, BookOpen } from "lucide-react";
import { animations } from "@/lib/animations";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/tree", label: "Árvore", icon: TreePine },
  ];

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
              <BookOpen className="h-6 w-6" />
              <h1 className="text-xl font-bold">Anotações Políticas</h1>
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
    </div>
  );
}

import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "@/components/Auth/LoginForm";
import { SignUpForm } from "@/components/Auth/SignUpForm";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Sparkles, Shield, Zap } from "lucide-react";

export function AuthPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");

  // Se já estiver autenticado, redirecionar para o dashboard
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-foreground border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      <div className="relative flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-foreground p-3 rounded-xl">
                <FileText className="h-8 w-8 text-background" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Topics</h1>
            </div>

            <h2 className="text-4xl font-bold text-foreground mb-6">
              Organize suas ideias com inteligência
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Sistema avançado de anotações hierárquicas com sincronização em
              tempo real, templates inteligentes e busca poderosa.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-muted p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-foreground">Templates inteligentes</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-muted p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-foreground">
                  Sincronização instantânea
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-muted p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-foreground">
                  Dados seguros e privados
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto w-full max-w-sm"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
              <div className="bg-foreground p-2 rounded-lg">
                <FileText className="h-6 w-6 text-background" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Topics</h1>
            </div>

            <div className="bg-card border rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
                </h2>
                <p className="text-muted-foreground">
                  {mode === "login"
                    ? "Entre para acessar suas anotações"
                    : "Comece a organizar suas ideias"}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginForm onToggleMode={() => setMode("signup")} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SignUpForm onToggleMode={() => setMode("login")} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Seus dados são protegidos com criptografia de ponta a ponta
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

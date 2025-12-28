import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation, Link } from "wouter";
import { Zap, Loader2, ArrowLeft, User, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface FloatingInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  icon: typeof User;
  testId: string;
}

function FloatingInput({ label, type = "text", value, onChange, icon: Icon, testId }: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;
  
  return (
    <div className="relative">
      <label
        className={`floating-label left-10 ${
          isActive ? "floating-label-active" : "floating-label-inactive"
        }`}
      >
        {label}
      </label>
      <Icon 
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
          focused ? "text-cyan-400" : "text-muted-foreground"
        }`} 
        strokeWidth={1.5} 
      />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="cyber-input pl-10"
        data-testid={testId}
      />
    </div>
  );
}

export function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      setLocation("/deck");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      loginMutation.mutate();
    }
  };
  
  return (
    <div className="min-h-screen bg-background mesh-gradient flex flex-col">
      <div className="absolute inset-0 bg-cyber-grid bg-cyber-grid opacity-20" />
      
      <header className="relative z-10 p-4">
        <Link href="/">
          <button 
            className="p-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2 text-muted-foreground"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm">Back</span>
          </button>
        </Link>
      </header>
      
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 mb-4 glow-cyan">
              <Zap className="w-8 h-8 text-slate-950" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue networking</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <FloatingInput
              label="Username"
              value={username}
              onChange={setUsername}
              icon={User}
              testId="input-username"
            />
            
            <FloatingInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              icon={Lock}
              testId="input-password"
            />
            
            <Button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold h-12 glow-cyan"
              disabled={loginMutation.isPending || !username || !password}
              data-testid="button-login"
            >
              {loginMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <p className="text-center text-muted-foreground text-sm mt-6">
            Don't have an account?{" "}
            <Link href="/register">
              <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer" data-testid="link-register">
                Create one
              </span>
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}

export function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/register", { name, username, password });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      setLocation("/deck");
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && username && password) {
      registerMutation.mutate();
    }
  };
  
  return (
    <div className="min-h-screen bg-background mesh-gradient flex flex-col">
      <div className="absolute inset-0 bg-cyber-grid bg-cyber-grid opacity-20" />
      
      <header className="relative z-10 p-4">
        <Link href="/">
          <button 
            className="p-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2 text-muted-foreground"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm">Back</span>
          </button>
        </Link>
      </header>
      
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 mb-4 glow-cyan">
              <Zap className="w-8 h-8 text-slate-950" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Join Tether</h1>
            <p className="text-muted-foreground">Create your professional profile</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <FloatingInput
              label="Full Name"
              value={name}
              onChange={setName}
              icon={User}
              testId="input-name"
            />
            
            <FloatingInput
              label="Username"
              value={username}
              onChange={setUsername}
              icon={Mail}
              testId="input-username"
            />
            
            <FloatingInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              icon={Lock}
              testId="input-password"
            />
            
            <Button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold h-12 glow-cyan"
              disabled={registerMutation.isPending || !name || !username || !password}
              data-testid="button-register"
            >
              {registerMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          
          <p className="text-center text-muted-foreground text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer" data-testid="link-login">
                Sign in
              </span>
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}

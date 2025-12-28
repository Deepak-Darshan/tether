import { motion } from "framer-motion";
import { Link } from "wouter";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background mesh-gradient flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-cyber-grid bg-cyber-grid opacity-20" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-md"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-purple-500/20 flex items-center justify-center border border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-400" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-5xl font-bold text-foreground mb-2" data-testid="text-404">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 glow-cyan" data-testid="button-go-home">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          
          <Button
            variant="outline"
            className="border-white/20 hover:bg-white/5"
            onClick={() => window.history.back()}
            data-testid="button-go-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

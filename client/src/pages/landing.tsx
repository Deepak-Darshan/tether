import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Zap, Users, MessageSquare, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen animated-gradient-bg mesh-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid bg-cyber-grid opacity-30" />
      
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-slate-950" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight" data-testid="text-logo">TETHER</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/login">
              <button 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-login"
              >
                Sign In
              </button>
            </Link>
          </motion.div>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center max-w-3xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-6"
            >
              <span className="inline-block px-4 py-2 rounded-full text-xs font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 glow-cyan">
                Professional Networking Reimagined
              </span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="text-foreground">Build the </span>
              <span className="gradient-text glow-text-cyan animate-gradient-x bg-[length:200%_auto]">
                Future
              </span>
              <br />
              <span className="text-foreground">Together</span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto"
            >
              Connect with builders, entrepreneurs, and innovators. 
              Swipe right to forge powerful business connections.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/deck">
                <button 
                  className="group relative px-8 py-4 bg-cyan-500 text-slate-950 font-semibold rounded-lg transition-all duration-300 glow-cyan flex items-center gap-3"
                  data-testid="button-enter-app"
                >
                  <span>Enter App</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 rounded-lg bg-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
              </Link>
              
              <Link href="/register">
                <button 
                  className="px-8 py-4 border border-white/20 text-foreground font-medium rounded-lg transition-all duration-300 hover:bg-white/5 hover:border-white/30"
                  data-testid="button-create-account"
                >
                  Create Account
                </button>
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full"
          >
            <FeatureCard
              icon={Users}
              title="Smart Matching"
              description="AI-powered connections based on skills and goals"
              delay={0}
            />
            <FeatureCard
              icon={Sparkles}
              title="Swipe to Connect"
              description="Intuitive gestures make networking effortless"
              delay={0.1}
            />
            <FeatureCard
              icon={MessageSquare}
              title="Secure Messaging"
              description="Encrypted conversations with your matches"
              delay={0.2}
            />
          </motion.div>
        </main>
        
        <footer className="p-6 text-center text-sm text-muted-foreground">
          <p data-testid="text-copyright">&copy; 2024 Tether. Building the future of professional networking.</p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  delay 
}: { 
  icon: typeof Users; 
  title: string; 
  description: string; 
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 + delay }}
      className="glass-card p-6 text-center"
    >
      <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/20">
        <Icon className="w-6 h-6 text-cyan-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-foreground font-semibold mb-2" data-testid={`text-feature-${title.toLowerCase().replace(/\s/g, '-')}`}>{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}

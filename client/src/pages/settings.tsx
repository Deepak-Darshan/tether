import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { ArrowLeft, LogOut, Shield, Bell, Eye, HelpCircle, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SettingsItemProps {
  icon: typeof Shield;
  label: string;
  description?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onClick?: () => void;
  testId: string;
}

function SettingsItem({ 
  icon: Icon, 
  label, 
  description, 
  toggle, 
  toggleValue, 
  onToggle, 
  onClick,
  testId 
}: SettingsItemProps) {
  const content = (
    <>
      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
      </div>
      
      {toggle ? (
        <Switch
          checked={toggleValue}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-cyan-500"
        />
      ) : (
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
      )}
    </>
  );

  if (toggle) {
    return (
      <div
        className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors text-left cursor-pointer"
        onClick={() => onToggle?.(!toggleValue)}
        data-testid={testId}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors text-left"
      data-testid={testId}
    >
      {content}
    </button>
  );
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  return (
    <div className="min-h-screen bg-background mesh-gradient">
      <header className="sticky top-0 z-30 glass border-b border-white/10">
        <div className="flex items-center gap-3 h-14 px-4">
          <Link href="/deck">
            <button 
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground" data-testid="text-settings-title">Settings</h1>
        </div>
      </header>
      
      <main className="p-4 pb-8">
        <div className="max-w-md mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/10">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Preferences
              </h2>
            </div>
            
            <div className="divide-y divide-white/5">
              <SettingsItem
                icon={Bell}
                label="Notifications"
                description="Receive match and message alerts"
                toggle
                toggleValue={notifications}
                onToggle={setNotifications}
                testId="toggle-notifications"
              />
              
              <SettingsItem
                icon={Eye}
                label="Profile Visibility"
                description="Show your profile to other users"
                toggle
                toggleValue={profileVisible}
                onToggle={setProfileVisible}
                testId="toggle-visibility"
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/10">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Security
              </h2>
            </div>
            
            <div className="divide-y divide-white/5">
              <SettingsItem
                icon={Shield}
                label="Privacy Policy"
                description="Read our privacy policy"
                onClick={() => {}}
                testId="link-privacy"
              />
              
              <SettingsItem
                icon={HelpCircle}
                label="Help & Support"
                description="Get help with your account"
                onClick={() => {}}
                testId="link-help"
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="outline"
              className="w-full h-14 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <LogOut className="w-5 h-5 mr-2" />
              )}
              Sign Out
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-xs text-muted-foreground">
              Tether v1.0.0
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Build the Future Together
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

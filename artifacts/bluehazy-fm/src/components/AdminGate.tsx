import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ADMIN_PASSWORD = "bluehazy2025";
const SESSION_KEY = "bh_admin_auth";

interface Props {
  children: React.ReactNode;
}

export function AdminGate({ children }: Props) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  // Persist auth in sessionStorage so refresh doesn't log out mid-session
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  }

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="glass border border-white/10 rounded-2xl p-10 w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Admin Access</h1>
        <p className="text-muted-foreground text-sm mb-8">Enter the admin password to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary text-center text-lg tracking-widest"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-sm font-medium">Incorrect password. Try again.</p>
          )}
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-11">
            Enter
          </Button>
        </form>
      </div>
    </div>
  );
}

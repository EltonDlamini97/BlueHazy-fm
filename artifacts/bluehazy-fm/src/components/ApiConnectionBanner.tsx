import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onRetry?: () => void;
};

export function ApiConnectionBanner({ onRetry }: Props) {
  const isDev = import.meta.env.DEV;

  return (
    <div role="alert" className="container mx-auto px-4 py-4 mb-2">
      <div className="glass border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex gap-3 flex-1">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-semibold text-sm">Unable to load content</p>
            <p className="text-muted-foreground text-sm mt-1">
              {isDev
                ? <>Start the API on port <strong className="text-white">8080</strong> with <code className="text-primary">DATABASE_URL</code> set, then refresh.</>
                : "The server is waking up — this may take 30 seconds on first load. Please retry."}
            </p>
          </div>
        </div>
        {onRetry && (
          <Button type="button" variant="outline" size="sm" className="shrink-0 border-white/20 text-white hover:bg-white/10" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

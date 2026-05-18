import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onRetry?: () => void;
};

export function ApiConnectionBanner({ onRetry }: Props) {
  return (
    <div role="alert" className="container mx-auto px-4 py-4 mb-2">
      <div className="glass border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex gap-3 flex-1">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-semibold text-sm">Cannot load station data</p>
            <p className="text-muted-foreground text-sm mt-1">
              Start the API on port <strong className="text-white">8080</strong> (Supabase via{" "}
              <code className="text-primary">DATABASE_URL</code>), then refresh. From repo root:{" "}
              <code className="text-primary">pnpm dev</code> or{" "}
              <code className="text-primary">pnpm dev:api</code> in a second terminal.
            </p>
          </div>
        </div>
        {onRetry && (
          <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

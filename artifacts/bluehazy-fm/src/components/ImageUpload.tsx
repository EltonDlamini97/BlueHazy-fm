import { useRef, useState } from "react";
import { uploadImage } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Link, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  label?: string;
}

export default function ImageUpload({ value, onChange, folder = "uploads", placeholder = "https://...", label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"url" | "file">("file");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Check your Supabase storage bucket.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm text-white/80">{label}</label>}

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
            mode === "file" ? "bg-primary text-white" : "text-white/50 hover:text-white"
          }`}
        >
          <Upload className="w-3 h-3" /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
            mode === "url" ? "bg-primary text-white" : "text-white/50 hover:text-white"
          }`}
        >
          <Link className="w-3 h-3" /> Paste URL
        </button>
      </div>

      {mode === "file" ? (
        <div
          className="relative border-2 border-dashed border-white/10 rounded-xl hover:border-primary/50 transition-colors cursor-pointer bg-white/5 group"
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
            data-testid="input-file-upload"
          />

          {value && !uploading ? (
            <div className="relative">
              <img src={value} alt="Preview" className="w-full h-36 object-cover rounded-xl" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <p className="text-white text-sm font-semibold">Click to change</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : uploading ? (
            <div className="h-36 flex flex-col items-center justify-center gap-2 text-primary">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-xs text-white/60">Uploading to Supabase...</p>
            </div>
          ) : (
            <div className="h-36 flex flex-col items-center justify-center gap-2 text-white/40 group-hover:text-primary/70 transition-colors">
              <Upload className="w-7 h-7" />
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload image</p>
                <p className="text-xs mt-0.5">PNG, JPG, GIF, WebP — max 10 MB</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary"
            data-testid="input-image-url"
          />
          {value && (
            <div className="relative rounded-xl overflow-hidden h-36 bg-white/5">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1.5">
          <X className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

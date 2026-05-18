import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { RADIO_STREAM_URL } from "@/lib/radio-stream";

type RadioPlayerContextValue = {
  isPlaying: boolean;
  volume: number;
  error: string | null;
  clearError: () => void;
  setVolume: (value: number) => void;
  togglePlay: () => void;
};

const RadioPlayerContext = createContext<RadioPlayerContextValue | null>(null);

function playMessage(err: unknown): string {
  const name = err instanceof Error ? err.name : "";
  if (name === "NotAllowedError") {
    return "Your browser blocked playback. Click play once more.";
  }
  return "Cannot connect to the live stream. Confirm Zeno.fm is broadcasting, then try again.";
}

export function RadioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamReadyRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => {
      setIsPlaying(true);
      setError(null);
    };
    const onPause = () => {
      if (audio.paused) setIsPlaying(false);
    };
    const onError = () => {
      setIsPlaying(false);
      const code = audio.error?.code;
      if (code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        setError("This stream format is not supported in your browser.");
      } else {
        setError(
          "Stream unavailable. Confirm you are live on Zeno.fm, then click play.",
        );
      }
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
  }, []);

  const attachStream = useCallback((audio: HTMLAudioElement) => {
    if (streamReadyRef.current) return;
    audio.src = RADIO_STREAM_URL;
    streamReadyRef.current = true;
  }, []);

  const attemptPlay = useCallback((audio: HTMLAudioElement) => {
    const promise = audio.play();
    if (!promise) return;

    promise.catch((err: unknown) => {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setIsPlaying(false);
      setError(playMessage(err));
    });
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    setError(null);
    attachStream(audio);

    attemptPlay(audio);

    if (audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      const onReady = () => {
        audio.removeEventListener("canplay", onReady);
        if (audio.paused) attemptPlay(audio);
      };
      audio.addEventListener("canplay", onReady, { once: true });
    }
  }, [attachStream, attemptPlay]);

  return (
    <RadioPlayerContext.Provider
      value={{ isPlaying, volume, error, clearError, setVolume, togglePlay }}
    >
      {children}
      <audio ref={audioRef} preload="none" playsInline />
    </RadioPlayerContext.Provider>
  );
}

export function useRadioPlayer(): RadioPlayerContextValue {
  const ctx = useContext(RadioPlayerContext);
  if (!ctx) {
    throw new Error("useRadioPlayer must be used within RadioPlayerProvider");
  }
  return ctx;
}

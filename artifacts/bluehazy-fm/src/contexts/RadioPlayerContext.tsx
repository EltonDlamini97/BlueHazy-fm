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

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000; // 3s between retries

export function RadioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [error, setError] = useState<string | null>(null);

  // Reconnect state
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userStoppedRef = useRef(false); // true when user explicitly paused

  // Sync volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
  }, [volume]);

  const clearRetryTimer = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  const startStream = useCallback((audio: HTMLAudioElement) => {
    // Force reload the stream source to get a fresh connection
    audio.src = `${RADIO_STREAM_URL}?t=${Date.now()}`;
    audio.load();
    const promise = audio.play();
    if (!promise) return;
    promise.catch((err: unknown) => {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Your browser blocked playback. Tap play to start.");
        setIsPlaying(false);
        return;
      }
      // Other errors — will be caught by the error event handler
    });
  }, []);

  const scheduleReconnect = useCallback((audio: HTMLAudioElement) => {
    if (userStoppedRef.current) return;
    if (retryCountRef.current >= MAX_RETRIES) {
      setError("Stream unavailable. Check your connection and try again.");
      setIsPlaying(false);
      return;
    }
    retryCountRef.current += 1;
    const delay = RETRY_DELAY_MS * retryCountRef.current;
    retryTimerRef.current = setTimeout(() => {
      if (!userStoppedRef.current) {
        startStream(audio);
      }
    }, delay);
  }, [startStream]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => {
      setIsPlaying(true);
      setError(null);
      retryCountRef.current = 0; // reset retry counter on successful play
    };

    const onPause = () => {
      // Only update state if user paused — not if we're reconnecting
      if (userStoppedRef.current) {
        setIsPlaying(false);
      }
    };

    const onError = () => {
      if (userStoppedRef.current) return;
      setIsPlaying(false);
      scheduleReconnect(audio);
    };

    const onStalled = () => {
      // Stream stalled (buffering stopped) — reconnect
      if (userStoppedRef.current) return;
      clearRetryTimer();
      scheduleReconnect(audio);
    };

    const onEnded = () => {
      // Live streams shouldn't end — reconnect if they do
      if (userStoppedRef.current) return;
      scheduleReconnect(audio);
    };

    // Handle page visibility — reconnect when tab comes back into focus
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && isPlaying && audio.paused && !userStoppedRef.current) {
        clearRetryTimer();
        retryCountRef.current = 0;
        startStream(audio);
      }
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    audio.addEventListener("stalled", onStalled);
    audio.addEventListener("ended", onEnded);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("stalled", onStalled);
      audio.removeEventListener("ended", onEnded);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearRetryTimer();
    };
  }, [isPlaying, scheduleReconnect, startStream]);

  const clearError = useCallback(() => setError(null), []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      // User explicitly stopping
      userStoppedRef.current = true;
      clearRetryTimer();
      audio.pause();
      audio.src = ""; // release the stream connection
      setIsPlaying(false);
      return;
    }

    // User starting playback
    userStoppedRef.current = false;
    retryCountRef.current = 0;
    setError(null);
    startStream(audio);
  }, [startStream]);

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

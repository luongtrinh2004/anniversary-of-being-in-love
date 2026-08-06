import { useEffect, useState } from "react";

// Global audio reference to ensure only ONE track can ever play at any given time across the app
let globalAudioInstance = null;

export default function useAudio(src, initialVolume = 0.6, autoPlay = true) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(initialVolume);

  const stopGlobalAudio = () => {
    if (globalAudioInstance) {
      try {
        globalAudioInstance.pause();
        globalAudioInstance.currentTime = 0;
      } catch (err) {
        console.warn("Error stopping audio", err);
      }
      globalAudioInstance = null;
    }
  };

  const play = async () => {
    if (!globalAudioInstance) return;
    try {
      await globalAudioInstance.play();
      globalAudioInstance.volume = volume;
      setIsPlaying(true);
    } catch (error) {
      console.log("Autoplay playback waiting for user gesture", error);
    }
  };

  const pause = () => {
    stopGlobalAudio();
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!src) return;

    // Stop any existing audio immediately to prevent duplicate audio tracks playing!
    stopGlobalAudio();

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.preload = "auto";
    globalAudioInstance = audio;

    let hasPlayed = false;

    const tryPlay = async () => {
      if (hasPlayed || !autoPlay || !globalAudioInstance) return;
      try {
        await globalAudioInstance.play();
        hasPlayed = true;
        setIsPlaying(true);
      } catch (err) {
        // Handle browser autoplay policy by playing on first user gesture
        const onUserGesture = async () => {
          if (globalAudioInstance && !hasPlayed) {
            try {
              await globalAudioInstance.play();
              hasPlayed = true;
              setIsPlaying(true);
            } catch (gestureErr) {
              console.warn("Gesture play blocked", gestureErr);
            }
          }
          window.removeEventListener("click", onUserGesture);
          window.removeEventListener("touchstart", onUserGesture);
          window.removeEventListener("keydown", onUserGesture);
        };
        window.addEventListener("click", onUserGesture, { once: true });
        window.addEventListener("touchstart", onUserGesture, { once: true });
        window.addEventListener("keydown", onUserGesture, { once: true });
      }
    };

    if (autoPlay) {
      tryPlay();
    }

    return () => {
      // Clean up on unmount or logout
      if (globalAudioInstance === audio) {
        audio.pause();
        audio.currentTime = 0;
        globalAudioInstance = null;
      }
      setIsPlaying(false);
    };
  }, [src, autoPlay, volume]);

  const updateVolume = (nextVolume) => {
    setVolume(nextVolume);
    if (globalAudioInstance) {
      globalAudioInstance.volume = nextVolume;
    }
  };

  return {
    isPlaying,
    volume,
    play,
    pause,
    updateVolume
  };
}

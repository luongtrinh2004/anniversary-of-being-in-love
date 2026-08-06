import { useEffect, useState, useRef } from "react";

let globalAudioInstance = null;

export default function useAudio(sourcesInput, initialVolume = 0.6, autoPlay = true) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Normalize input into a standardized playlist array: [{ id, name, source }]
  const playlist = Array.isArray(sourcesInput)
    ? sourcesInput.map((item, idx) => (typeof item === 'string' ? { id: 'm_' + idx, name: `Bài hát ${idx + 1}`, source: item } : item)).filter((item) => item && item.source)
    : typeof sourcesInput === 'string' && sourcesInput
    ? [{ id: 'm_0', name: 'Từng Ngày Yêu Em', source: sourcesInput }]
    : [{ id: 'm_0', name: 'Từng Ngày Yêu Em', source: '/music.mp3' }];

  const playlistRef = useRef(playlist);
  const trackIndexRef = useRef(currentTrackIndex);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    trackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  const activeTrack = playlist[currentTrackIndex] || playlist[0] || { source: '/music.mp3', name: 'Từng Ngày Yêu Em' };

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
    const firstSource = playlistRef.current[0]?.source || '/music.mp3';
    if (!firstSource) return;

    stopGlobalAudio();

    const audio = new Audio(firstSource);
    audio.volume = volume;
    audio.preload = "auto";
    audio.loop = playlistRef.current.length === 1;
    globalAudioInstance = audio;

    const handleEnded = () => {
      const currentList = playlistRef.current;
      if (currentList.length > 1) {
        const nextIndex = (trackIndexRef.current + 1) % currentList.length;
        const nextTrack = currentList[nextIndex];
        if (nextTrack && nextTrack.source && globalAudioInstance) {
          globalAudioInstance.src = nextTrack.source;
          globalAudioInstance.currentTime = 0;
          globalAudioInstance.loop = currentList.length === 1;
          globalAudioInstance
            .play()
            .then(() => setIsPlaying(true))
            .catch((err) => console.warn("Playlist transition play error", err));
          setCurrentTrackIndex(nextIndex);
        }
      }
    };

    audio.addEventListener("ended", handleEnded);

    let hasPlayed = false;

    const tryPlay = async () => {
      if (hasPlayed || !autoPlay || !globalAudioInstance) return;
      try {
        await globalAudioInstance.play();
        hasPlayed = true;
        setIsPlaying(true);
      } catch (err) {
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
      audio.removeEventListener("ended", handleEnded);
      if (globalAudioInstance === audio) {
        audio.pause();
        audio.currentTime = 0;
        globalAudioInstance = null;
      }
      setIsPlaying(false);
    };
  }, [playlist.length, autoPlay]);

  const updateVolume = (nextVolume) => {
    setVolume(nextVolume);
    if (globalAudioInstance) {
      globalAudioInstance.volume = nextVolume;
    }
  };

  return {
    isPlaying,
    volume,
    currentTrackName: activeTrack?.name || 'Từng Ngày Yêu Em',
    currentTrackIndex: currentTrackIndex + 1,
    totalTracks: playlist.length,
    play,
    pause,
    updateVolume
  };
}

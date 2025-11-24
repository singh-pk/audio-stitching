import { useCallback, useEffect, useRef, useState } from "react";

import { useOpfsDirectories } from "../../hooks";

import { Controls } from "../Controls";

export const StitchAudio = () => {
  const { getAllFiles, folders, isLoading } = useOpfsDirectories();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const playbackTimerRef = useRef({
    duration: 0,
    startTime: 0,
    volume: 80,
    filesLen: 0,
  }).current;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currTime, setCurrTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isStitching, setIsStitching] = useState(false);

  const createNewAudioContext = useCallback(() => {
    audioCtxRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) createNewAudioContext();
    return audioCtxRef.current as AudioContext;
  }, [createNewAudioContext]);

  const getGainNode = useCallback(() => {
    const audioCtx = getAudioContext();

    // Always create a fresh GainNode for each playback session
    const gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = playbackTimerRef.volume / 100;

    // Store reference for volume control
    gainNodeRef.current = gainNode;

    return gainNode;
  }, [playbackTimerRef, getAudioContext]);

  const stopPlayback = useCallback(async () => {
    const audioCtx = getAudioContext();

    setIsPlaying(false);
    await audioCtx.suspend();

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, [getAudioContext]);

  const endPlayback = useCallback(async () => {
    setIsPlaying(false);

    if (audioCtxRef.current && audioCtxRef.current?.state !== "closed") {
      await audioCtxRef.current.close();
    }

    createNewAudioContext();
    playbackTimerRef.duration = 0;
    playbackTimerRef.filesLen = 0;
    playbackTimerRef.startTime = 0;
    setCurrTime(0);
    setDuration(0);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, [createNewAudioContext, playbackTimerRef]);

  const updatePlaybackTime = useCallback(async () => {
    const audioCtx = getAudioContext();
    const { duration, startTime } = playbackTimerRef;
    const elapsedTime = audioCtx.currentTime - startTime;

    if (elapsedTime > duration) {
      await stopPlayback();
      return;
    }

    if (elapsedTime <= duration && elapsedTime >= 0) {
      setCurrTime(elapsedTime);
    }

    animationRef.current = requestAnimationFrame(() => {
      updatePlaybackTime();
    });
  }, [stopPlayback, getAudioContext, playbackTimerRef]);

  const onPlayClick = useCallback(async () => {
    let audioCtx = getAudioContext();

    // Resume context if suspended due to browser autoplay policies
    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
      setIsPlaying(true);
      updatePlaybackTime();
      return;
    }

    if (isPlaying) {
      await stopPlayback();
      return;
    }

    await endPlayback();
    audioCtx = getAudioContext();

    setIsStitching(true);

    const data = await getAllFiles();

    playbackTimerRef.filesLen = data.length;

    const audioBuffers = await Promise.all(
      data.map(async ({ buffer }) => {
        return await audioCtx.decodeAudioData(buffer);
      }),
    );

    const totalDuration = audioBuffers.reduce(
      (sum, buffer) => sum + buffer.duration,
      0,
    );
    setDuration(totalDuration);

    let startTime = audioCtx.currentTime;
    playbackTimerRef.duration = totalDuration;
    playbackTimerRef.startTime = startTime;

    let lastSourceNode: AudioBufferSourceNode | null = null;

    const gainNode = getGainNode();

    for (const buffer of audioBuffers) {
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode);

      source.start(startTime);

      startTime += buffer.duration;
      lastSourceNode = source;
    }

    if (lastSourceNode) {
      lastSourceNode.onended = async () => {
        await stopPlayback();
        await audioCtx.close();
      };
    }

    setIsPlaying(true);
    setIsStitching(false);
    updatePlaybackTime();
  }, [
    stopPlayback,
    endPlayback,
    getAudioContext,
    getGainNode,
    getAllFiles,
    updatePlaybackTime,
    isPlaying,
    playbackTimerRef,
  ]);

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      playbackTimerRef.volume = newVolume;

      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = newVolume / 100;
      }
    },
    [playbackTimerRef],
  );

  useEffect(() => {
    if (
      playbackTimerRef.filesLen === 0 ||
      folders.length === playbackTimerRef.filesLen
    ) {
      return;
    }

    endPlayback();
  }, [folders, playbackTimerRef, endPlayback]);

  return (
    <Controls
      disabled={isLoading || isStitching}
      currTime={currTime}
      duration={duration}
      isPlaying={isPlaying}
      onPlayClick={onPlayClick}
      defaultVolume={playbackTimerRef.volume}
      onVolumeChange={handleVolumeChange}
    />
  );
};

"use client";

import { useState, useEffect, useRef } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";

const SOUNDS = [
  { id: "rain", label: "Rainfall", emoji: "🌧️", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  { id: "ocean", label: "Ocean Waves", emoji: "🌊", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
  { id: "forest", label: "Forest Birds", emoji: "🌲", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" },
  { id: "lofi", label: "Lofi Beats", emoji: "🎵", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
];

export default function FocusRoom() {
  // Timer states
  const [mode, setMode] = useState("Study"); // Study, Short Break, Long Break
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [customStudyTime, setCustomStudyTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Audio mixer states
  const [activeSounds, setActiveSounds] = useState({});
  const [soundVolumes, setSoundVolumes] = useState({
    rain: 0.5,
    ocean: 0.5,
    forest: 0.5,
    lofi: 0.5,
    binaural: 0.3,
  });

  // Binaural Beat (Web Audio API) state
  const [isBinauralPlaying, setIsBinauralPlaying] = useState(false);

  const timerRef = useRef(null);
  const audioRefs = useRef({});
  const audioCtxRef = useRef(null);
  const oscillatorsRef = useRef([]);

  // Setup initial timer values
  useEffect(() => {
    resetTimer();
  }, [mode, customStudyTime, customBreakTime]);

  // Main timer tick
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, minutes, seconds]);

  // Clear audio objects on unmount
  useEffect(() => {
    return () => {
      // Pause all HTML5 audios
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
        }
      });
      // Stop Web Audio oscillators
      stopBinauralBeats();
    };
  }, []);

  const handleTimerComplete = () => {
    setIsActive(false);
    // Alert sound
    try {
      const alertAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav");
      alertAudio.volume = 0.5;
      alertAudio.play();
    } catch (e) {
      console.log("Alert sound failed to play", e);
    }

    if (mode === "Study") {
      setCompletedSessions((prev) => prev + 1);
      setMode("Short Break");
      alert("Study session complete! Time to take a mindful break.");
    } else {
      setMode("Study");
      alert("Break finished! Let's resume studying with focus.");
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === "Study") {
      setMinutes(customStudyTime);
    } else if (mode === "Short Break") {
      setMinutes(customBreakTime);
    } else {
      setMinutes(15); // Long Break default
    }
    setSeconds(0);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  // HTML5 Sound Controls
  const toggleSound = (soundId, url) => {
    const isPlaying = activeSounds[soundId];

    if (!audioRefs.current[soundId]) {
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = soundVolumes[soundId];
      audioRefs.current[soundId] = audio;
    }

    const audio = audioRefs.current[soundId];

    if (isPlaying) {
      audio.pause();
      setActiveSounds((prev) => ({ ...prev, [soundId]: false }));
    } else {
      audio.play().catch((err) => console.log("Audio play blocked", err));
      setActiveSounds((prev) => ({ ...prev, [soundId]: true }));
    }
  };

  const handleVolumeChange = (soundId, val) => {
    const vol = parseFloat(val);
    setSoundVolumes((prev) => ({ ...prev, [soundId]: vol }));
    if (audioRefs.current[soundId]) {
      audioRefs.current[soundId].volume = vol;
    }
  };

  // Binaural Beats Web Audio Synthesis (8Hz Alpha waves for focus)
  const startBinauralBeats = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create stereo panner/nodes for binaural beat
      // Left channel: 200 Hz
      const oscL = ctx.createOscillator();
      const gainL = ctx.createGain();
      const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      oscL.type = "sine";
      oscL.frequency.value = 200;
      gainL.gain.value = soundVolumes.binaural * 0.15; // keep it quiet

      // Right channel: 208 Hz (Creating a binaural difference of 8Hz)
      const oscR = ctx.createOscillator();
      const gainR = ctx.createGain();
      const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      oscR.type = "sine";
      oscR.frequency.value = 208;
      gainR.gain.value = soundVolumes.binaural * 0.15;

      if (pannerL && pannerR) {
        pannerL.pan.value = -1; // Left
        pannerR.pan.value = 1;  // Right
        oscL.connect(gainL).connect(pannerL).connect(ctx.destination);
        oscR.connect(gainR).connect(pannerR).connect(ctx.destination);
      } else {
        // Fallback for browsers that don't support stereo panner
        oscL.connect(gainL).connect(ctx.destination);
        oscR.connect(gainR).connect(ctx.destination);
      }

      oscL.start();
      oscR.start();

      oscillatorsRef.current = [oscL, oscR, gainL, gainR];
      setIsBinauralPlaying(true);
    } catch (e) {
      console.error("Web Audio API not supported or blocked", e);
      alert("Binaural beats initialization failed. Your browser may have blocked audio.");
    }
  };

  const stopBinauralBeats = () => {
    if (oscillatorsRef.current.length > 0) {
      oscillatorsRef.current.forEach((node) => {
        try {
          node.stop();
        } catch (e) {}
      });
      oscillatorsRef.current = [];
    }
    setIsBinauralPlaying(false);
  };

  const toggleBinaural = () => {
    if (isBinauralPlaying) {
      stopBinauralBeats();
    } else {
      startBinauralBeats();
    }
  };

  const handleBinauralVolumeChange = (val) => {
    const vol = parseFloat(val);
    setSoundVolumes((prev) => ({ ...prev, binaural: vol }));
    
    // Dynamically adjust gain node volume if oscillators are running
    if (oscillatorsRef.current.length >= 4) {
      const gainL = oscillatorsRef.current[2];
      const gainR = oscillatorsRef.current[3];
      if (gainL) gainL.gain.value = vol * 0.15;
      if (gainR) gainR.gain.value = vol * 0.15;
    }
  };

  // Format digital clock
  const displayMin = String(minutes).padStart(2, "0");
  const displaySec = String(seconds).padStart(2, "0");
  const progressPercent = ((minutes * 60 + seconds) / ((mode === "Study" ? customStudyTime : customBreakTime) * 60)) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 animate-fade-in">
      
      {/* Left: Pomodoro Timer */}
      <Card className="bg-white border-slate-100/80 flex flex-col justify-between p-8">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Mindful Focus Timer</h2>
              <p className="text-xs text-slate-400 mt-1">Boost study endurance, minimize anxiety</p>
            </div>
            <div className="flex gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-2xl">
              {["Study", "Short Break"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMode(t)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === t 
                      ? "bg-brand-indigo text-white shadow-sm" 
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Large Clock Display */}
          <div className="relative flex flex-col items-center justify-center py-12">
            
            {/* Pulsing ring around time */}
            <div className="absolute w-64 h-64 border-2 border-indigo-100 rounded-full flex items-center justify-center">
              <div 
                className={`absolute inset-0 border-4 border-brand-indigo rounded-full transition-all duration-300`}
                style={{
                  clipPath: `inset(0 0 0 0)`,
                  transform: "rotate(-90deg)",
                  opacity: 0.15
                }}
              />
              <div 
                className={`w-60 h-60 rounded-full bg-slate-50/50 flex flex-col items-center justify-center border border-slate-100 ${
                  isActive ? "animate-pulse-ring" : ""
                }`}
              >
                <span className="text-6xl font-extrabold text-slate-800 tracking-tighter">
                  {displayMin}:{displaySec}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-2">
                  {mode === "Study" ? "Study Focus" : "Breathe & Rest"}
                </span>
              </div>
            </div>
            
            {/* Spacing for absolute layout */}
            <div className="w-64 h-64"></div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 space-y-6">
          <div className="flex justify-center items-center gap-4">
            <Button
              onClick={resetTimer}
              variant="ghost"
              className="py-3 px-5 text-xs font-bold"
            >
              Reset
            </Button>
            <Button
              onClick={toggleTimer}
              variant={isActive ? "rose" : "primary"}
              className="py-3.5 px-8 text-sm font-bold min-w-[140px]"
            >
              {isActive ? "Pause Focus" : "Start Focus"}
            </Button>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Timer Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Study Block (min)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={customStudyTime}
                  onChange={(e) => setCustomStudyTime(parseInt(e.target.value) || 25)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Mindful Break (min)</label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={customBreakTime}
                  onChange={(e) => setCustomBreakTime(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 text-center">
              Focus sessions completed today: <span className="font-bold text-brand-indigo">{completedSessions}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Right: Ambient Soundscapes */}
      <Card className="bg-white border-slate-100/80 flex flex-col p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Study Soundscapes</h2>
          <p className="text-xs text-slate-400 mt-1">Blend soothing audio to mask external exam distractions</p>
        </div>

        {/* Binaural Beat Generator Card */}
        <div className="mb-6 p-5 rounded-[22px] bg-indigo-50/70 border border-indigo-100/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">8Hz Binaural Beats</h4>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Alpha brainwaves for memory</p>
              </div>
            </div>
            <button
              onClick={toggleBinaural}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isBinauralPlaying 
                  ? "bg-brand-indigo text-white shadow-sm shadow-indigo-300/40" 
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {isBinauralPlaying ? "Playing" : "Synthesize"}
            </button>
          </div>
          <p className="text-xs text-slate-500 leading-normal mb-4">
            Generates offset frequencies (200Hz & 208Hz) that induce focus brainwaves. Use headphones for the full effect.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase w-12">Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolumes.binaural}
              onChange={(e) => handleBinauralVolumeChange(e.target.value)}
              className="flex-1 accent-brand-indigo h-1.5 bg-indigo-100 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Mixable sounds list */}
        <div className="space-y-4 flex-1">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mixable Environment Tones</h4>
          
          {SOUNDS.map((sound) => {
            const isPlaying = activeSounds[sound.id];
            return (
              <div 
                key={sound.id}
                className={`p-3 border rounded-2xl transition-all ${
                  isPlaying 
                    ? "border-teal-200 bg-teal-50/20" 
                    : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => toggleSound(sound.id, sound.url)}
                    className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                  >
                    <span className="text-xl">{sound.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{sound.label}</p>
                      <p className="text-[10px] text-slate-400">Royalty-free stream</p>
                    </div>
                  </button>

                  <div className="flex items-center gap-4">
                    {/* Equalizer Graphic */}
                    {isPlaying && (
                      <div className="flex items-end gap-0.5 h-6 w-8 pb-1">
                        <div className="w-1 bg-brand-teal rounded-full eq-bar-1" style={{ height: "4px" }}></div>
                        <div className="w-1 bg-brand-teal rounded-full eq-bar-2" style={{ height: "8px" }}></div>
                        <div className="w-1 bg-brand-teal rounded-full eq-bar-3" style={{ height: "6px" }}></div>
                        <div className="w-1 bg-brand-teal rounded-full eq-bar-4" style={{ height: "10px" }}></div>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => toggleSound(sound.id, sound.url)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        isPlaying 
                          ? "bg-brand-teal border-brand-teal text-white" 
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {isPlaying ? "Mute" : "Blend"}
                    </button>
                  </div>
                </div>

                {/* Volume slider for blended sound */}
                {isPlaying && (
                  <div className="flex items-center gap-3 mt-3 px-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase w-12">Volume</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={soundVolumes[sound.id]}
                      onChange={(e) => handleVolumeChange(sound.id, e.target.value)}
                      className="flex-1 accent-brand-teal h-1 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  );
}

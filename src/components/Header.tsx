import React from 'react';
import { Play, Pause, Volume2, VolumeX, FastForward, Sparkles, Building2 } from 'lucide-react';
import { playClickSound } from '../sim/sound';

interface HeaderProps {
  isAiLive: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
  isSoundOn: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAiLive,
  isPaused,
  onTogglePause,
  simSpeed,
  onChangeSpeed,
  isSoundOn,
  onToggleSound,
}) => {
  return (
    <header className="border-b-4 border-[#1e293b] bg-[#080d1a] px-3 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border-2 border-cyan-400 bg-cyan-950 shadow-[0_0_12px_rgba(0,229,255,0.4)]">
            <Building2 className="h-6 w-6 text-cyan-400" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-pixel text-base font-extrabold tracking-wider text-cyan-300 sm:text-lg">
                INTI
              </h1>
              <span className="rounded bg-purple-950/80 px-1.5 py-0.5 font-pixel text-[9px] text-purple-300 border border-purple-700">
                WEB & APK STUDIO
              </span>
            </div>
            <p className="font-terminal text-xs text-slate-400">
              Pixel AI Studio: Spesialis Pembuatan Web, APK Android, Game & Software
            </p>
          </div>
        </div>

        {/* Live Status & Simulator Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* AI vs Simulation Pill */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-pixel text-[10px] border ${
              isAiLive
                ? 'border-emerald-500 bg-emerald-950/70 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'border-amber-500 bg-amber-950/70 text-amber-300'
            }`}
            title={isAiLive ? 'Google Gemini 3.1 Flash Lite aktif di server' : 'Mode simulasi deterministik (tanpa API key)'}
          >
            <Sparkles className="h-3 w-3" />
            <span>{isAiLive ? 'AI LIVE (GEMINI 3.1 LITE)' : 'MODE SIMULASI'}</span>
          </div>

          {/* Pause / Play Button */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onTogglePause();
            }}
            className="flex items-center gap-1 rounded border border-[#2a3854] bg-[#10182b] px-2.5 py-1.5 font-terminal text-xs text-slate-200 hover:border-cyan-400 active:translate-y-0.5"
            title={isPaused ? 'Lanjutkan simulasi' : 'Jeda simulasi'}
          >
            {isPaused ? <Play className="h-3.5 w-3.5 text-emerald-400" /> : <Pause className="h-3.5 w-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{isPaused ? 'Lanjut' : 'Jeda'}</span>
          </button>

          {/* Speed Selector (1x, 2x, 4x) */}
          <div className="flex items-center rounded border border-[#2a3854] bg-[#10182b] p-0.5 font-terminal text-xs">
            <span className="px-1.5 text-slate-400 hidden sm:inline">
              <FastForward className="h-3.5 w-3.5" />
            </span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => {
                  playClickSound();
                  onChangeSpeed(spd);
                }}
                className={`rounded px-2 py-0.5 transition-colors ${
                  simSpeed === spd
                    ? 'bg-cyan-600 font-bold text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onToggleSound();
            }}
            className="rounded border border-[#2a3854] bg-[#10182b] p-1.5 text-slate-300 hover:border-cyan-400"
            title={isSoundOn ? 'Matikan Suara 8-Bit' : 'Nyalakan Suara 8-Bit'}
          >
            {isSoundOn ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};

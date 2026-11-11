import React from 'react';
import { Volume2, VolumeX, Award, BookOpen, PenTool, CheckCircle2, FileText, Share2 } from 'lucide-react';
import { sound } from '../utils/sound';

interface HeaderProps {
  activeTab: 'rules' | 'fill' | 'build' | 'custom';
  setActiveTab: (tab: 'rules' | 'fill' | 'build' | 'custom') => void;
  stars: number;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onOpenCertificate: () => void;
  onOpenShare: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  stars,
  soundEnabled,
  setSoundEnabled,
  onOpenCertificate,
  onOpenShare,
  savedCount,
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => {
              setActiveTab('rules');
              sound.playClick();
            }}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
              T
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                TATTZ-Meister
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                Klasse 7
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none" aria-label="Lernstufen">
            <button
              onClick={() => {
                setActiveTab('rules');
                sound.playClick();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'rules'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>1. TATTZ-Formel</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('fill');
                sound.playClick();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'fill'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>2. Lückentext-Training</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('build');
                sound.playClick();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'build'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <PenTool className="w-4 h-4 shrink-0" />
              <span>3. Eigene Sätze bauen</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('custom');
                sound.playClick();
              }}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'custom'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Freier Text</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Score */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Stars counter */}
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-2.5 py-1 rounded-lg text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-semibold tabular-nums">
              <span className="text-amber-500">★</span>
              <span>{stars} Sterne</span>
            </div>

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Ton ausschalten' : 'Ton einschalten'}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Sound umschalten"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Share / Student Link Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenShare();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors whitespace-nowrap"
              title="Direkten Link & QR-Code für Schüler öffnen"
            >
              <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Schüler-Link</span>
            </button>

            {/* Certificate Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenCertificate();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Urkunde</span>
              {savedCount > 0 && (
                <span className="ml-0.5 bg-indigo-800 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

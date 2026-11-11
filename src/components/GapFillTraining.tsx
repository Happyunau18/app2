import React, { useState } from 'react';
import { PRACTICE_TEXTS, ERROR_DETECTIVE_TASKS } from '../data/tattzData';
import { Check, X, ArrowRight, RotateCcw, Sparkles, HelpCircle, Eye, AlertCircle } from 'lucide-react';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface GapFillTrainingProps {
  onNextStage: () => void;
  onAddStars: (count: number) => void;
  completedTexts: string[];
  setCompletedTexts: React.Dispatch<React.SetStateAction<string[]>>;
}

export const GapFillTraining: React.FC<GapFillTrainingProps> = ({
  onNextStage,
  onAddStars,
  completedTexts,
  setCompletedTexts,
}) => {
  const [currentTextIdx, setCurrentTextIdx] = useState<number>(0);
  const [activeSubTab, setActiveSubTab] = useState<'lueckentext' | 'detektiv'>('lueckentext');

  const text = PRACTICE_TEXTS[currentTextIdx];

  // User selections for the 5 slots
  const [selectedTextsorte, setSelectedTextsorte] = useState<string>('');
  const [selectedTitel, setSelectedTitel] = useState<string>('');
  const [selectedAutor, setSelectedAutor] = useState<string>('');
  const [selectedZeit, setSelectedZeit] = useState<string>('');
  const [selectedThema, setSelectedThema] = useState<string>('');

  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // Error Detective sub-state
  const [detectiveIdx, setDetectiveIdx] = useState<number>(0);
  const [foundErrorIds, setFoundErrorIds] = useState<number[]>([]);
  const [detectiveSolved, setDetectiveSolved] = useState<boolean>(false);

  // Validation results
  const isTextsorteCorrect =
    selectedTextsorte === text.correctAnswers?.textsorte || selectedTextsorte === text.textsorte;
  const isTitelCorrect =
    selectedTitel === text.correctAnswers?.titel ||
    selectedTitel === `„${text.titel}“` ||
    selectedTitel === text.titel;
  const isAutorCorrect =
    selectedAutor === text.correctAnswers?.autor || selectedAutor === text.autor;
  const isZeitCorrect =
    selectedZeit === text.correctAnswers?.zeit || selectedZeit === text.jahr.toString();
  const isThemaCorrect =
    selectedThema === text.correctAnswers?.thema ||
    selectedThema === text.thema ||
    selectedThema === text.options.thema[0];

  const allCorrect =
    isTextsorteCorrect && isTitelCorrect && isAutorCorrect && isZeitCorrect && isThemaCorrect;

  const handleCheck = () => {
    sound.playClick();
    setHasChecked(true);

    if (allCorrect) {
      sound.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      if (!completedTexts.includes(text.id)) {
        setCompletedTexts(prev => [...prev, text.id]);
        onAddStars(3);
      }
    } else {
      sound.playSoftMiss();
    }
  };

  const handleReset = () => {
    sound.playClick();
    setSelectedTextsorte('');
    setSelectedTitel('');
    setSelectedAutor('');
    setSelectedZeit('');
    setSelectedThema('');
    setHasChecked(false);
    setShowSolution(false);
  };

  const handleSelectText = (idx: number) => {
    sound.playClick();
    setCurrentTextIdx(idx);
    handleReset();
  };

  // Error Detective helpers
  const currentDetectiveTask = ERROR_DETECTIVE_TASKS[detectiveIdx];

  const handleToggleError = (errIndex: number) => {
    sound.playClick();
    if (foundErrorIds.includes(errIndex)) {
      setFoundErrorIds(prev => prev.filter(i => i !== errIndex));
    } else {
      const next = [...foundErrorIds, errIndex];
      setFoundErrorIds(next);
      if (next.length === currentDetectiveTask.errors.length) {
        setDetectiveSolved(true);
        sound.playFanfare();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        onAddStars(2);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header and Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Stufe 1 von 2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Vorgegebene TATTZ-Sätze ausfüllen
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Lies die Text-Informationen genau und setze die passenden Bausteine in die Lücken ein.
          </p>
        </div>

        {/* Sub-Tabs: Lückentext vs Fehler-Detektiv */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => {
              setActiveSubTab('lueckentext');
              sound.playClick();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeSubTab === 'lueckentext'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Lückentext-Training
          </button>
          <button
            onClick={() => {
              setActiveSubTab('detektiv');
              sound.playClick();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeSubTab === 'detektiv'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Bonus: Fehler-Detektiv
          </button>
        </div>
      </div>

      {activeSubTab === 'lueckentext' ? (
        <>
          {/* Text Selector Carousel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Wähle einen Übungstext:</span>
              <span>
                {completedTexts.length} von {PRACTICE_TEXTS.length} Texten gemeistert
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {PRACTICE_TEXTS.map((pt, idx) => {
                const isCurrent = idx === currentTextIdx;
                const isDone = completedTexts.includes(pt.id);
                return (
                  <button
                    key={pt.id}
                    onClick={() => handleSelectText(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                        : isDone
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-500 dark:text-slate-400">#{idx + 1}</span>
                      {isDone && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {pt.titel}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{pt.autor}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Infokarte des vorgegebenen Textes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  i
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Vorgegebene Text-Informationen (Infoblatt)
                </h2>
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-md">
                Klasse 7 Lektüre
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/40 italic">
              „{text.kurzbeschreibung}“
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl">
                <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                    T
                  </span>
                  Textsorte
                </div>
                <div className="font-bold text-sm text-emerald-950 dark:text-emerald-100 mt-1">
                  {text.textsorte}
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 rounded-xl">
                <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-4 h-4 rounded bg-blue-500 text-white flex items-center justify-center text-[10px]">
                    A
                  </span>
                  Autor
                </div>
                <div className="font-bold text-sm text-blue-950 dark:text-blue-100 mt-1">
                  {text.autor}
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-xl">
                <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center text-[10px]">
                    T
                  </span>
                  Titel
                </div>
                <div className="font-bold text-sm text-amber-950 dark:text-amber-100 mt-1">
                  „{text.titel}“
                </div>
              </div>

              <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/50 rounded-xl">
                <div className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-4 h-4 rounded bg-purple-500 text-white flex items-center justify-center text-[10px]">
                    Z
                  </span>
                  Zeit
                </div>
                <div className="font-bold text-sm text-purple-950 dark:text-purple-100 mt-1">
                  {text.jahr}
                </div>
              </div>

              <div className="p-3 col-span-2 sm:col-span-1 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/50 rounded-xl">
                <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-4 h-4 rounded bg-rose-500 text-white flex items-center justify-center text-[10px]">
                    T
                  </span>
                  Thema (Kern)
                </div>
                <div className="font-bold text-xs text-rose-950 dark:text-rose-100 mt-1 line-clamp-2">
                  {text.thema}
                </div>
              </div>
            </div>
          </div>

          {/* Der interaktive Lückentext-Satz */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                TATTZ-Satz vervollständigen
              </h3>
              <button
                onClick={() => {
                  setShowSolution(prev => !prev);
                  sound.playClick();
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showSolution ? 'Lösung verbergen' : 'Musterlösung zeigen'}</span>
              </button>
            </div>

            {/* Live sentence with slots */}
            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/70 border border-indigo-100 dark:border-slate-700 text-base sm:text-lg leading-loose text-slate-800 dark:text-slate-200 font-medium">
              <span>{text.leadIn ? `${text.leadIn} ` : 'In der/dem '}</span>
              {/* Slot 1: Textsorte */}
              <span
                className={`inline-block px-2.5 py-0.5 rounded-lg border mx-1 font-bold ${
                  hasChecked
                    ? isTextsorteCorrect
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                      : 'bg-rose-100 border-rose-400 text-rose-800'
                    : selectedTextsorte
                    ? 'bg-white dark:bg-slate-900 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white/80 dark:bg-slate-900/80 border-dashed border-slate-300 text-slate-400'
                }`}
              >
                {selectedTextsorte || '[1. Textsorte?]'}
              </span>

              {/* Slot 2: Titel */}
              <span
                className={`inline-block px-2.5 py-0.5 rounded-lg border mx-1 font-bold ${
                  hasChecked
                    ? isTitelCorrect
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                      : 'bg-rose-100 border-rose-400 text-rose-800'
                    : selectedTitel
                    ? 'bg-white dark:bg-slate-900 border-amber-400 text-amber-700 dark:text-amber-300'
                    : 'bg-white/80 dark:bg-slate-900/80 border-dashed border-slate-300 text-slate-400'
                }`}
              >
                {selectedTitel || '[2. Titel in Anführungszeichen?]'}
              </span>

              <span> von </span>

              {/* Slot 3: Autor */}
              <span
                className={`inline-block px-2.5 py-0.5 rounded-lg border mx-1 font-bold ${
                  hasChecked
                    ? isAutorCorrect
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                      : 'bg-rose-100 border-rose-400 text-rose-800'
                    : selectedAutor
                    ? 'bg-white dark:bg-slate-900 border-blue-400 text-blue-700 dark:text-blue-300'
                    : 'bg-white/80 dark:bg-slate-900/80 border-dashed border-slate-300 text-slate-400'
                }`}
              >
                {selectedAutor || '[3. Autor/in?]'}
              </span>

              <span>{text.jahr.toString().includes('v. Chr.') ? ' (' : ' aus dem Jahr '}</span>

              {/* Slot 4: Zeit */}
              <span
                className={`inline-block px-2.5 py-0.5 rounded-lg border mx-1 font-bold ${
                  hasChecked
                    ? isZeitCorrect
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                      : 'bg-rose-100 border-rose-400 text-rose-800'
                    : selectedZeit
                    ? 'bg-white dark:bg-slate-900 border-purple-400 text-purple-700 dark:text-purple-300'
                    : 'bg-white/80 dark:bg-slate-900/80 border-dashed border-slate-300 text-slate-400'
                }`}
              >
                {selectedZeit || '[4. Zeit?]'}
              </span>

              <span>{text.jahr.toString().includes('v. Chr.') ? ') ' : ' '}</span>
              <span>{text.connectorVerb ? `${text.connectorVerb} ` : 'geht es um '}</span>

              {/* Slot 5: Thema */}
              <span
                className={`inline-block px-2.5 py-0.5 rounded-lg border mx-1 font-bold ${
                  hasChecked
                    ? isThemaCorrect
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                      : 'bg-rose-100 border-rose-400 text-rose-800'
                    : selectedThema
                    ? 'bg-white dark:bg-slate-900 border-rose-400 text-rose-700 dark:text-rose-300'
                    : 'bg-white/80 dark:bg-slate-900/80 border-dashed border-slate-300 text-slate-400'
                }`}
              >
                {selectedThema || '[5. Thema im Präsens?]'}
              </span>
              <span>.</span>
            </div>

            {/* Solution preview */}
            {showSolution && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Musterlösung für den Einleitungssatz:
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {text.sampleSolution}
                </p>
              </div>
            )}

            {/* Choice selectors for each slot */}
            <div className="space-y-4 pt-2">
              {/* 1. Textsorte Choices */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                    T
                  </span>
                  1. Textsorte auswählen:
                </div>
                <div className="flex flex-wrap gap-2">
                  {text.options.textsorte.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedTextsorte(opt);
                        sound.playClick();
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        selectedTextsorte === opt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Titel Choices */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center text-[10px]">
                    T
                  </span>
                  2. Titel auswählen (mit Anführungszeichen):
                </div>
                <div className="flex flex-wrap gap-2">
                  {text.options.titel.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedTitel(opt);
                        sound.playClick();
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        selectedTitel === opt
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Autor Choices */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-blue-500 text-white flex items-center justify-center text-[10px]">
                    A
                  </span>
                  3. Autor/in auswählen:
                </div>
                <div className="flex flex-wrap gap-2">
                  {text.options.autor.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedAutor(opt);
                        sound.playClick();
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        selectedAutor === opt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Zeit Choices */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-purple-500 text-white flex items-center justify-center text-[10px]">
                    Z
                  </span>
                  4. Zeit / Erscheinungsjahr auswählen:
                </div>
                <div className="flex flex-wrap gap-2">
                  {text.options.zeit.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedZeit(opt);
                        sound.playClick();
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        selectedZeit === opt
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Thema Choices */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-rose-500 text-white flex items-center justify-center text-[10px]">
                    T
                  </span>
                  5. Thema im Präsens auswählen:
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {text.options.thema.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedThema(opt);
                        sound.playClick();
                      }}
                      className={`text-left p-2.5 text-xs font-medium rounded-lg border transition-all ${
                        selectedThema === opt
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                      }`}
                    >
                      ... {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Validation Banner */}
            {hasChecked && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  allCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-100'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-100'
                }`}
              >
                {allCorrect ? (
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="font-bold">
                    {allCorrect
                      ? 'Perfekt ausgefüllt! +3 Sterne erhalten!'
                      : 'Noch nicht ganz richtig – schau dir die rot markierten Lücken an!'}
                  </div>
                  <p>
                    {allCorrect
                      ? 'Dein Einleitungssatz enthält alle 5 TATTZ-Elemente fehlerfrei. Du kannst nun den nächsten Text ausprobieren oder direkt zu Stufe 2 wechseln!'
                      : 'Tipp: Vergleiche deine Auswahl noch einmal mit den Angaben auf dem oberen Infoblatt.'}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Zurücksetzen</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCheck}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-sm transition-all"
                >
                  Satz überprüfen
                </button>

                {allCorrect && (
                  <button
                    onClick={() => {
                      sound.playSuccess();
                      if (currentTextIdx < PRACTICE_TEXTS.length - 1) {
                        handleSelectText(currentTextIdx + 1);
                      } else {
                        onNextStage();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
                  >
                    <span>{currentTextIdx < PRACTICE_TEXTS.length - 1 ? 'Nächster Text' : 'Zu Stufe 2 (Eigene Sätze)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Fehler-Detektiv Mode */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                Detektiv-Herausforderung #{detectiveIdx + 1}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Finde die Fehler in diesem TATTZ-Satz
              </h2>
              <p className="text-xs text-slate-500">
                Schüler Max hat diesen Einleitungssatz geschrieben. Welche typischen Fehler hat er gemacht?
              </p>
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {ERROR_DETECTIVE_TASKS.map((task, idx) => (
                <button
                  key={task.id}
                  onClick={() => {
                    setDetectiveIdx(idx);
                    setFoundErrorIds([]);
                    setDetectiveSolved(false);
                    sound.playClick();
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                    detectiveIdx === idx
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Fall {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Faulty Sentence Box */}
          <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
            <div className="text-xs font-bold text-rose-800 dark:text-rose-300">
              Fehlerhafter Satz von Max ({currentDetectiveTask.textTitle}):
            </div>
            <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 italic">
              „{currentDetectiveTask.faultySentence}“
            </p>
          </div>

          {/* Interactive Error Checklist */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Welche Fehler entdeckst du? Klicke alle zutreffenden an ({foundErrorIds.length} von{' '}
              {currentDetectiveTask.errors.length} gefunden):
            </div>

            <div className="space-y-2">
              {currentDetectiveTask.errors.map((err, errIdx) => {
                const isFound = foundErrorIds.includes(errIdx);
                return (
                  <button
                    key={err.description}
                    onClick={() => handleToggleError(errIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isFound
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        isFound
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isFound && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-semibold">{err.description}</div>
                      {isFound && (
                        <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                          ✓ Korrektur: {err.correction}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Solved Banner */}
          {detectiveSolved && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 space-y-2">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Super detektivische Arbeit! So lautet der Satz fehlerfrei:</span>
              </div>
              <p className="text-sm font-medium text-emerald-950 dark:text-emerald-100">
                „{currentDetectiveTask.correctedSentence}“
              </p>
            </div>
          )}
        </div>
      )}

      {/* Direct Transition to Stage 2 */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            sound.playSuccess();
            onNextStage();
          }}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm sm:text-base font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-all shadow-xs"
        >
          <span>Bereit für eigene Sätze? Zu Schritt 2 wechseln</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

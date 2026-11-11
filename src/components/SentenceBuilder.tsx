import React, { useState, useEffect } from 'react';
import { PRACTICE_TEXTS, FORMULATION_VERBS } from '../data/tattzData';
import { validateStudentSentence, ValidationStatus } from '../utils/tattzValidator';
import { getTextsorteGrammar, getAuthorGrammar } from '../utils/grammar';
import { EvaluationResult, StudentSentenceEntry } from '../types';
import {
  Check,
  AlertCircle,
  Sparkles,
  Bot,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Eye,
  BookmarkPlus,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface SentenceBuilderProps {
  onAddStars: (count: number) => void;
  onSaveSentence: (entry: StudentSentenceEntry) => void;
  savedSentences: StudentSentenceEntry[];
}

export const SentenceBuilder: React.FC<SentenceBuilderProps> = ({
  onAddStars,
  onSaveSentence,
  savedSentences,
}) => {
  const [currentTextIdx, setCurrentTextIdx] = useState<number>(0);
  const text = PRACTICE_TEXTS[currentTextIdx];
  const textGrammar = getTextsorteGrammar(text.textsorte);
  const authorGrammar = getAuthorGrammar(text.autor);

  const [studentSentence, setStudentSentence] = useState<string>('');
  const [validation, setValidation] = useState<ValidationStatus | null>(null);

  // AI Evaluation state
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<EvaluationResult | null>(null);
  const [showSample, setShowSample] = useState<boolean>(false);
  const [alreadySaved, setAlreadySaved] = useState<boolean>(false);

  // Live validation on every change
  useEffect(() => {
    if (studentSentence.trim().length > 3) {
      const val = validateStudentSentence(studentSentence, text);
      setValidation(val);
    } else {
      setValidation(null);
    }
  }, [studentSentence, text]);

  // Check if current text was already saved
  useEffect(() => {
    const isSaved = savedSentences.some(s => s.textId === text.id);
    setAlreadySaved(isSaved);
  }, [text.id, savedSentences]);

  const handleSelectText = (idx: number) => {
    sound.playClick();
    setCurrentTextIdx(idx);
    setStudentSentence('');
    setAiResult(null);
    setShowSample(false);
  };

  const insertTextAtCursor = (insertion: string) => {
    sound.playClick();
    setStudentSentence(prev => {
      const trimmed = prev.trimEnd();
      return trimmed ? `${trimmed} ${insertion}` : insertion;
    });
  };

  const insertQuotes = () => {
    sound.playClick();
    setStudentSentence(prev => `${prev}„${text.titel}“ `);
  };

  // Immediate local check
  const handleLocalCheck = () => {
    sound.playClick();
    const val = validateStudentSentence(studentSentence, text);
    setValidation(val);

    if (val.allComplete) {
      sound.playSuccess();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.65 } });
      onAddStars(3);
    } else {
      sound.playSoftMiss();
    }
  };

  // AI Coach check via backend route /api/check-tattz
  const handleAskAICoach = async () => {
    if (!studentSentence.trim()) return;
    sound.playClick();
    setIsLoadingAI(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/check-tattz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence: studentSentence,
          textInfo: {
            textsorte: text.textsorte,
            autor: text.autor,
            titel: text.titel,
            jahr: text.jahr,
            thema: text.thema,
          },
        }),
      });

      if (!res.ok) throw new Error('Netzwerk-Antwort fehlerhaft');
      const data: EvaluationResult = await res.json();
      setAiResult(data);

      if (data.stars === 3) {
        sound.playFanfare();
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        onAddStars(3);
      } else {
        sound.playSuccess();
        onAddStars(data.stars);
      }
    } catch (err) {
      console.warn('AI Coach fallback:', err);
      // Fallback to local evaluation
      const val = validateStudentSentence(studentSentence, text);
      const fallbackResult: EvaluationResult = {
        tattzCoverage: {
          textsorte: val.hasTextsorte,
          autor: val.hasAutor,
          titel: val.hasTitel && val.hasQuotesAroundTitel,
          thema: val.hasThemaSignal,
          zeit: val.hasZeit,
        },
        praesensCheck: !val.hasPastTenseWarning && val.hasThemaSignal,
        anfuehrungszeichenCheck: val.hasQuotesAroundTitel,
        rating: val.allComplete ? 'perfekt' : val.elementsFoundCount >= 3 ? 'gut' : 'fast_da',
        stars: val.allComplete ? 3 : val.elementsFoundCount >= 3 ? 2 : 1,
        praise: val.allComplete
          ? 'Großartig gemacht! Du hast alle 5 TATTZ-Elemente selbstständig formuliert!'
          : 'Schon ein starker Ansatz! Prüfe noch die Hinweise in der Checkliste.',
        feedback: val.tips.length === 0
          ? 'Dein Satz ist vollständig und erfüllt alle Kriterien für die 7. Klasse.'
          : val.tips.join(' '),
        proTip: 'Verwende Präsens und achte darauf, dass der Titel immer in Anführungszeichen steht.',
      };
      setAiResult(fallbackResult);
      sound.playSuccess();
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSaveToCertificate = () => {
    if (!studentSentence.trim()) return;
    sound.playStar();
    const entry: StudentSentenceEntry = {
      id: `${text.id}-${Date.now()}`,
      textId: text.id,
      textTitle: `„${text.titel}“ (${text.autor})`,
      studentSentence: studentSentence.trim(),
      timestamp: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      stars: aiResult?.stars || (validation?.allComplete ? 3 : 2),
      rating: aiResult?.rating || (validation?.allComplete ? 'perfekt' : 'gut'),
    };
    onSaveSentence(entry);
    setAlreadySaved(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Page Title */}
      <div>
        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          Stufe 2 von 2
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Komplett eigene TATTZ-Sätze bilden
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Jetzt bist du dran: Formuliere anhand der vorgegebenen Informationen einen eigenen, flüssigen Einleitungssatz!
        </p>
      </div>

      {/* Text Carousel Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">Wähle deinen Text für die Formulierung:</span>
          <span>{currentTextIdx + 1} von {PRACTICE_TEXTS.length} Texten</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {PRACTICE_TEXTS.map((pt, idx) => {
            const isCurrent = idx === currentTextIdx;
            const isSaved = savedSentences.some(s => s.textId === pt.id);
            return (
              <button
                key={pt.id}
                onClick={() => handleSelectText(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                    : isSaved
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-500 dark:text-slate-400">#{idx + 1}</span>
                  {isSaved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
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

      {/* Raw Information Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              T
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Vorgegebene Textdaten zu „{text.titel}“
            </h2>
          </div>
          <button
            onClick={() => {
              setShowSample(prev => !prev);
              sound.playClick();
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 self-start sm:self-auto"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showSample ? 'Muster verbergen' : 'Muster-Inspiration'}</span>
          </button>
        </div>

        {/* 5 Information Tags */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
              [T] Textsorte
            </span>
            <div className="font-bold text-sm text-emerald-950 dark:text-emerald-100 mt-1">
              {text.textsorte}
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl">
            <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider block">
              [A] Autor/in
            </span>
            <div className="font-bold text-sm text-blue-950 dark:text-blue-100 mt-1">
              {text.autor}
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl">
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
              [T] Titel
            </span>
            <div className="font-bold text-sm text-amber-950 dark:text-amber-100 mt-1">
              „{text.titel}“
            </div>
          </div>

          <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl">
            <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider block">
              [Z] Erscheinungsjahr
            </span>
            <div className="font-bold text-sm text-purple-950 dark:text-purple-100 mt-1">
              {text.jahr}
            </div>
          </div>

          <div className="p-3 col-span-2 sm:col-span-1 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl">
            <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider block">
              [T] Kern / Thema
            </span>
            <div className="font-bold text-xs text-rose-950 dark:text-rose-100 mt-1 line-clamp-2">
              {text.thema}
            </div>
          </div>
        </div>

        {/* Sample Inspiration Box */}
        {showSample && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
            <div className="font-bold text-slate-700 dark:text-slate-300">
              Mögliche Beispiel-Formulierungen:
            </div>
            <p className="text-slate-600 dark:text-slate-300 italic">
              Variante A: „{text.sampleSolution}“
            </p>
            <p className="text-slate-600 dark:text-slate-300 italic">
              Variante B: „{text.alternateSolution}“
            </p>
          </div>
        )}
      </div>

      {/* Editor & Live TATTZ Radar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        {/* Live TATTZ Radar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Live TATTZ-Radar
            </span>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              {validation?.elementsFoundCount ?? 0} von 5 Bausteinen erkannt
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {/* T - Textsorte */}
            <div
              className={`p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                validation?.hasTextsorte
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-500 text-white font-black text-[11px] flex items-center justify-center">
                  T
                </span>
                <span>Textsorte</span>
              </div>
              {validation?.hasTextsorte ? <Check className="w-4 h-4 text-emerald-600" /> : <span className="text-xs">○</span>}
            </div>

            {/* A - Autor */}
            <div
              className={`p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                validation?.hasAutor
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-blue-500 text-white font-black text-[11px] flex items-center justify-center">
                  A
                </span>
                <span>Autor</span>
              </div>
              {validation?.hasAutor ? <Check className="w-4 h-4 text-blue-600" /> : <span className="text-xs">○</span>}
            </div>

            {/* T - Titel */}
            <div
              className={`p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                validation?.hasTitel && validation?.hasQuotesAroundTitel
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-black text-[11px] flex items-center justify-center">
                  T
                </span>
                <span>Titel „...“</span>
              </div>
              {validation?.hasTitel && validation?.hasQuotesAroundTitel ? (
                <Check className="w-4 h-4 text-amber-600" />
              ) : (
                <span className="text-xs">○</span>
              )}
            </div>

            {/* T - Thema */}
            <div
              className={`p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                validation?.hasThemaSignal && !validation?.hasPastTenseWarning
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-rose-500 text-white font-black text-[11px] flex items-center justify-center">
                  T
                </span>
                <span>Thema (Präsens)</span>
              </div>
              {validation?.hasThemaSignal && !validation?.hasPastTenseWarning ? (
                <Check className="w-4 h-4 text-rose-600" />
              ) : (
                <span className="text-xs">○</span>
              )}
            </div>

            {/* Z - Zeit */}
            <div
              className={`p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                validation?.hasZeit
                  ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-purple-500 text-white font-black text-[11px] flex items-center justify-center">
                  Z
                </span>
                <span>Zeit / Jahr</span>
              </div>
              {validation?.hasZeit ? <Check className="w-4 h-4 text-purple-600" /> : <span className="text-xs">○</span>}
            </div>
          </div>

          {/* Past tense warning notice */}
          {validation?.hasPastTenseWarning && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Achtung: Zeitform prüfen!</strong> Im TATTZ-Satz steht das Thema immer im <strong>Präsens (Gegenwart)</strong>, z. B. „handelt von“ statt „handelte von“.
              </span>
            </div>
          )}
        </div>

        {/* Quick Insert Helpers */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Formulierungshilfen & Satzanfänge (anklicken zum Einfügen):</span>
            <button
              onClick={insertQuotes}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-xs"
            >
              + Titel mit Anführungszeichen einfügen
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => insertTextAtCursor(textGrammar.inDativ)}
              className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium"
            >
              „{textGrammar.inDativ}...“
            </button>
            <button
              onClick={() => insertTextAtCursor(textGrammar.nominativArtikel)}
              className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium"
            >
              „{textGrammar.nominativArtikel}...“
            </button>
            <button
              onClick={() => insertTextAtCursor(`${authorGrammar.label} ${text.autor} schildert`)}
              className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium"
            >
              „{authorGrammar.label} {text.autor}...“
            </button>
            <button
              onClick={() => insertTextAtCursor(`aus dem Jahr ${text.jahr}`)}
              className="px-2.5 py-1 text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 rounded-lg transition-colors font-medium"
            >
              „aus dem Jahr {text.jahr}“
            </button>
            {FORMULATION_VERBS.slice(0, 4).map(fv => (
              <button
                key={fv.verb}
                onClick={() => insertTextAtCursor(fv.verb)}
                className="px-2.5 py-1 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded-lg transition-colors font-medium"
              >
                {fv.verb}
              </button>
            ))}
          </div>
        </div>

        {/* The Text Area */}
        <div className="space-y-1.5">
          <label htmlFor="student-sentence" className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Dein vollständiger TATTZ-Einleitungssatz:
          </label>
          <textarea
            id="student-sentence"
            rows={4}
            value={studentSentence}
            onChange={e => setStudentSentence(e.target.value)}
            placeholder={`Schreibe hier deinen TATTZ-Satz zu „${text.titel}“... (z. B. ${textGrammar.inDativ} „${text.titel}“ von ${text.autor} aus dem Jahr ${text.jahr}...)`}
            className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base leading-relaxed"
          />
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Tipp: Ein Satz genügt – achte auf Groß- und Kleinschreibung!</span>
            <span>{studentSentence.length} Zeichen</span>
          </div>
        </div>

        {/* Evaluation Box from AI Coach or Local Checker */}
        {aiResult && (
          <div
            className={`p-5 rounded-2xl border space-y-3 transition-all ${
              aiResult.stars === 3
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-950 dark:text-emerald-100'
                : aiResult.stars === 2
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-950 dark:text-blue-100'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-950 dark:text-amber-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-sm">Feedback vom TATTZ-Schreibcoach</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-amber-500 text-sm">
                {Array.from({ length: aiResult.stars }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
                <span className="text-xs text-slate-600 dark:text-slate-400 ml-1">
                  ({aiResult.stars}/3 Sterne)
                </span>
              </div>
            </div>

            <div className="text-sm font-semibold">{aiResult.praise}</div>
            <p className="text-xs sm:text-sm leading-relaxed">{aiResult.feedback}</p>

            {aiResult.proTip && (
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-current/10 text-xs">
                <span className="font-bold block mb-0.5">💡 Schreib-Tipp für die 7. Klasse:</span>
                <span>{aiResult.proTip}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              sound.playClick();
              setStudentSentence('');
              setAiResult(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Zurücksetzen</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick local check */}
            <button
              onClick={handleLocalCheck}
              disabled={!studentSentence.trim()}
              className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50"
            >
              Sofort-Check
            </button>

            {/* AI Coach Evaluation Button */}
            <button
              onClick={handleAskAICoach}
              disabled={isLoadingAI || !studentSentence.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isLoadingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Coach analysiert Satz...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>KI-Schreibcoach fragen</span>
                </>
              )}
            </button>

            {/* Save to Certificate Button */}
            {(validation?.allComplete || (aiResult && aiResult.stars >= 2)) && (
              <button
                onClick={handleSaveToCertificate}
                disabled={alreadySaved}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs ${
                  alreadySaved
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{alreadySaved ? 'Im Zertifikat gespeichert ✓' : 'Ins Zertifikat speichern'}</span>
              </button>
            )}

            {/* Next Text Button */}
            <button
              onClick={() => {
                sound.playClick();
                handleSelectText((currentTextIdx + 1) % PRACTICE_TEXTS.length);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Nächster Text</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { validateStudentSentence, ValidationStatus } from '../utils/tattzValidator';
import { getTextsorteGrammar, getAuthorGrammar } from '../utils/grammar';
import { EvaluationResult, StudentSentenceEntry } from '../types';
import {
  Sparkles,
  Bot,
  RotateCcw,
  Check,
  AlertCircle,
  BookmarkPlus,
  Loader2,
  FileEdit,
  PenTool,
} from 'lucide-react';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface CustomTextSandboxProps {
  onAddStars: (count: number) => void;
  onSaveSentence: (entry: StudentSentenceEntry) => void;
}

export const CustomTextSandbox: React.FC<CustomTextSandboxProps> = ({
  onAddStars,
  onSaveSentence,
}) => {
  // Custom text input
  const [customInfo, setCustomInfo] = useState({
    textsorte: 'Kurzgeschichte',
    autor: '',
    titel: '',
    jahr: '',
    thema: '',
  });

  const textGrammar = getTextsorteGrammar(customInfo.textsorte);
  const authorGrammar = getAuthorGrammar(customInfo.autor);

  const [studentSentence, setStudentSentence] = useState<string>('');
  const [validation, setValidation] = useState<ValidationStatus | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<EvaluationResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleInfoChange = (field: string, val: string) => {
    setCustomInfo(prev => ({ ...prev, [field]: val }));
    setSavedSuccess(false);
  };

  const handleLiveCheck = () => {
    if (!studentSentence.trim()) return;
    const val = validateStudentSentence(studentSentence, customInfo);
    setValidation(val);
    if (val.allComplete) {
      sound.playSuccess();
      confetti({ particleCount: 50, spread: 60 });
      onAddStars(3);
    } else {
      sound.playSoftMiss();
    }
  };

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
          textInfo: customInfo,
        }),
      });

      if (!res.ok) throw new Error('Netzwerkfehler');
      const data: EvaluationResult = await res.json();
      setAiResult(data);

      if (data.stars === 3) {
        sound.playFanfare();
        confetti({ particleCount: 70, spread: 70 });
        onAddStars(3);
      } else {
        sound.playSuccess();
        onAddStars(data.stars);
      }
    } catch {
      // Fallback local check
      const val = validateStudentSentence(studentSentence, customInfo);
      setAiResult({
        tattzCoverage: {
          textsorte: val.hasTextsorte,
          autor: val.hasAutor,
          titel: val.hasTitel && val.hasQuotesAroundTitel,
          thema: val.hasThemaSignal,
          zeit: val.hasZeit,
        },
        praesensCheck: !val.hasPastTenseWarning && val.hasThemaSignal,
        anfuehrungszeichenCheck: val.hasQuotesAroundTitel,
        rating: val.allComplete ? 'perfekt' : 'gut',
        stars: val.allComplete ? 3 : 2,
        praise: 'Super, dass du deinen eigenen Text aus dem Deutschunterricht anwendest!',
        feedback: val.tips.length === 0 ? 'Alle Pflichtangaben vorhanden!' : val.tips.join(' '),
        proTip: 'Achte darauf, das Thema kurz und präzise im Präsens zu umreißen.',
      });
      sound.playSuccess();
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSave = () => {
    if (!studentSentence.trim()) return;
    sound.playStar();
    const entry: StudentSentenceEntry = {
      id: `custom-${Date.now()}`,
      textId: 'custom',
      textTitle: `„${customInfo.titel || 'Eigener Text'}“ (${customInfo.autor || 'Autor'})`,
      studentSentence: studentSentence.trim(),
      timestamp: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      stars: aiResult?.stars || 3,
      rating: aiResult?.rating || 'perfekt',
    };
    onSaveSentence(entry);
    setSavedSuccess(true);
    confetti({ particleCount: 40, spread: 50 });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div>
        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          Freier Modus
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileEdit className="w-7 h-7 text-indigo-600" />
          <span>Eigenen Text aus dem Deutschbuch eingeben</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Liest du gerade eine Lektüre oder eine Kurzgeschichte im Unterricht? Trage hier die Daten ein und trainiere deinen perfekten TATTZ-Einleitungssatz!
        </p>
      </div>

      {/* Form to enter custom text details */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          1. Text-Angaben aus deinem Deutschbuch
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              [T] Textsorte:
            </label>
            <select
              value={customInfo.textsorte}
              onChange={e => handleInfoChange('textsorte', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium"
            >
              <option value="Kurzgeschichte">Kurzgeschichte</option>
              <option value="Fabel">Fabel</option>
              <option value="Jugendroman">Jugendroman / Roman-Auszug</option>
              <option value="Kalendergeschichte">Kalendergeschichte</option>
              <option value="Parabel">Parabel</option>
              <option value="Anekdote">Anekdote</option>
              <option value="Ballade">Ballade / Gedicht</option>
              <option value="Sachtext">Sachtext / Zeitungsbericht</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              [A] Autor / Autorin:
            </label>
            <input
              type="text"
              placeholder="z. B. Wolfgang Borchert"
              value={customInfo.autor}
              onChange={e => handleInfoChange('autor', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              [T] Titel des Textes:
            </label>
            <input
              type="text"
              placeholder="z. B. Das Brot"
              value={customInfo.titel}
              onChange={e => handleInfoChange('titel', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              [Z] Erscheinungsjahr / Zeit:
            </label>
            <input
              type="text"
              placeholder="z. B. 1946 oder 18. Jahrhundert"
              value={customInfo.jahr}
              onChange={e => handleInfoChange('jahr', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              [T] Thema / Worum geht es grob im Kern?
            </label>
            <input
              type="text"
              placeholder="z. B. die Not und den Hunger eines alten Paares..."
              value={customInfo.thema}
              onChange={e => handleInfoChange('thema', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Write the sentence */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-indigo-600" />
          <span>2. Formuliere deinen TATTZ-Satz</span>
        </h2>

        {/* Grammar helper chips */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Passende Formulierungshilfen für {customInfo.textsorte}:</span>
            {customInfo.titel && (
              <button
                onClick={() => {
                  sound.playClick();
                  setStudentSentence(prev => `${prev ? prev.trimEnd() + ' ' : ''}„${customInfo.titel}“ `);
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-xs"
              >
                + Titel „{customInfo.titel}“ einfügen
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                setStudentSentence(prev => `${prev ? prev.trimEnd() + ' ' : ''}${textGrammar.inDativ} `);
              }}
              className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium"
            >
              „{textGrammar.inDativ}...“
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setStudentSentence(prev => `${prev ? prev.trimEnd() + ' ' : ''}${textGrammar.nominativArtikel} `);
              }}
              className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium"
            >
              „{textGrammar.nominativArtikel}...“
            </button>
            {customInfo.autor && (
              <button
                onClick={() => {
                  sound.playClick();
                  setStudentSentence(prev => `${prev ? prev.trimEnd() + ' ' : ''}${authorGrammar.label} ${customInfo.autor} `);
                }}
                className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium"
              >
                „{authorGrammar.label} {customInfo.autor}...“
              </button>
            )}
            {customInfo.jahr && (
              <button
                onClick={() => {
                  sound.playClick();
                  setStudentSentence(prev => `${prev ? prev.trimEnd() + ' ' : ''}aus dem Jahr ${customInfo.jahr} `);
                }}
                className="px-2.5 py-1 text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 rounded-lg transition-colors font-medium"
              >
                „aus dem Jahr {customInfo.jahr}“
              </button>
            )}
            <button
              onClick={() => {
                sound.playClick();
                setStudentSentence(prev => `${prev ? prev.trimEnd() + ' ' : ''}thematisiert `);
              }}
              className="px-2.5 py-1 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded-lg transition-colors font-medium"
            >
              thematisiert
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setStudentSentence(prev => `${prev ? prev.trimEnd() + ' ' : ''}handelt von `);
              }}
              className="px-2.5 py-1 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded-lg transition-colors font-medium"
            >
              handelt von
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setStudentSentence(prev => `${prev ? prev.trimEnd() + ' ' : ''}geht es um `);
              }}
              className="px-2.5 py-1 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded-lg transition-colors font-medium"
            >
              geht es um
            </button>
          </div>
        </div>

        <textarea
          rows={4}
          value={studentSentence}
          onChange={e => setStudentSentence(e.target.value)}
          placeholder={`Formuliere hier den vollständigen TATTZ-Satz zu „${customInfo.titel || 'deinem Text'}“... (z. B. ${textGrammar.inDativ} „${customInfo.titel || 'Titel'}“...)`}
          className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base leading-relaxed"
        />

        {/* Live radar mini */}
        {validation && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Live-Überprüfung deines Textes:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <span className={`p-2 rounded-lg border ${validation.hasTextsorte ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' : 'text-slate-400 border-slate-200'}`}>
                T - Textsorte: {validation.hasTextsorte ? '✓' : '○'}
              </span>
              <span className={`p-2 rounded-lg border ${validation.hasAutor ? 'bg-blue-50 text-blue-800 border-blue-300 font-bold' : 'text-slate-400 border-slate-200'}`}>
                A - Autor: {validation.hasAutor ? '✓' : '○'}
              </span>
              <span className={`p-2 rounded-lg border ${validation.hasTitel && validation.hasQuotesAroundTitel ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold' : 'text-slate-400 border-slate-200'}`}>
                T - Titel „...“: {validation.hasTitel && validation.hasQuotesAroundTitel ? '✓' : '○'}
              </span>
              <span className={`p-2 rounded-lg border ${validation.hasThemaSignal && !validation.hasPastTenseWarning ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold' : 'text-slate-400 border-slate-200'}`}>
                T - Thema: {validation.hasThemaSignal && !validation.hasPastTenseWarning ? '✓' : '○'}
              </span>
              <span className={`p-2 rounded-lg border ${validation.hasZeit ? 'bg-purple-50 text-purple-800 border-purple-300 font-bold' : 'text-slate-400 border-slate-200'}`}>
                Z - Zeit: {validation.hasZeit ? '✓' : '○'}
              </span>
            </div>

            {/* Warnings and Tips */}
            {validation.tips.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {validation.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Result Card */}
        {aiResult && (
          <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between font-bold text-indigo-900 dark:text-indigo-200">
              <span className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>Coach-Rückmeldung:</span>
              </span>
              <span className="text-amber-500">
                {'★'.repeat(aiResult.stars)} ({aiResult.stars}/3 Sterne)
              </span>
            </div>
            <p className="font-semibold">{aiResult.praise}</p>
            <p className="text-slate-600 dark:text-slate-300">{aiResult.feedback}</p>
            {aiResult.proTip && (
              <p className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-indigo-900/60 font-medium">
                💡 {aiResult.proTip}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setStudentSentence('');
              setValidation(null);
              setAiResult(null);
            }}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Leeren
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLiveCheck}
              disabled={!studentSentence.trim()}
              className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 disabled:opacity-50"
            >
              Schnell-Check
            </button>
            <button
              onClick={handleAskAICoach}
              disabled={isLoadingAI || !studentSentence.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {isLoadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Schreibcoach befragen</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!studentSentence.trim() || savedSuccess}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg ${
                savedSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>{savedSuccess ? 'Gespeichert ✓' : 'In Urkunde sichern'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { TATTZ_ELEMENTS, SENTENCE_TEMPLATES } from '../data/tattzData';
import { ArrowRight, Sparkles, Check, AlertCircle, BookmarkCheck } from 'lucide-react';
import { sound } from '../utils/sound';

interface RuleLaboratoryProps {
  onStartTraining: () => void;
}

export const RuleLaboratory: React.FC<RuleLaboratoryProps> = ({ onStartTraining }) => {
  const [selectedKey, setSelectedKey] = useState<string>('textsorte');
  const [activeTemplateIdx, setActiveTemplateIdx] = useState<number>(0);

  const selectedInfo = TATTZ_ELEMENTS[selectedKey];

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      {/* Hero Welcome */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Deutschunterricht Klasse 7 · Inhaltsangabe</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Die TATTZ-Formel meistern
        </h1>
        <p className="max-w-2xl mx-auto text-base text-slate-600 dark:text-slate-300">
          Der Einleitungssatz einer Inhaltsangabe liefert alle wichtigen Eckdaten auf einen Blick. 
          Mit der <strong className="text-slate-900 dark:text-white font-semibold">TATTZ-Eselsbrücke</strong> vergisst du garantiert keine Pflichtangabe mehr!
        </p>
      </div>

      {/* Interactive 5 TATTZ Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-indigo-600" />
            <span>Die 5 Bausteine im Überblick</span>
          </h2>
          <span className="text-xs text-slate-500">Klicke einen Buchstaben an</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(TATTZ_ELEMENTS).map(([key, info]) => {
            const isSelected = selectedKey === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedKey(key);
                  sound.playClick();
                }}
                className={`relative text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? `${info.borderColor} ${info.bgLight} shadow-sm ring-2 ring-indigo-500/20`
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-7 h-7 rounded-lg ${info.color} text-white font-black text-sm flex items-center justify-center shadow-xs`}
                  >
                    {info.letter}
                  </span>
                  {isSelected && <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Aktiv</span>}
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{info.name}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {info.shortDesc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Detail Inspector Card */}
        {selectedInfo && (
          <div className={`p-5 rounded-2xl border ${selectedInfo.borderColor} ${selectedInfo.bgLight} transition-all`}>
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl ${selectedInfo.color} text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-sm`}
              >
                {selectedInfo.letter}
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{selectedInfo.name}</h3>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{selectedInfo.question}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Typische Beispiele:</span>
                    <span className="text-slate-600 dark:text-slate-400">{selectedInfo.example}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Profi-Tipp:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">{selectedInfo.tip}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <span className="font-semibold text-rose-700 dark:text-rose-400 block mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Typische Falle:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">{selectedInfo.commonMistake}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sentence Templates / Satzbau-Muster */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              4 bewährte Satzbau-Muster
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Du musst nicht immer mit „In der Kurzgeschichte...“ anfangen. Deutschlehrer lieben stilistische Abwechslung!
            </p>
          </div>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg shrink-0">
            {SENTENCE_TEMPLATES.map((tmpl, idx) => (
              <button
                key={tmpl.name}
                onClick={() => {
                  setActiveTemplateIdx(idx);
                  sound.playClick();
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTemplateIdx === idx
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Muster {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Template Display */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            {SENTENCE_TEMPLATES[activeTemplateIdx].name}
          </div>
          <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
            {activeTemplateIdx === 0 && (
              <span>
                „In der <span className="text-emerald-600 font-bold">Kurzgeschichte [T]</span>{' '}
                <span className="text-amber-600 font-bold">‚Das Brot‘ [T]</span> von{' '}
                <span className="text-blue-600 font-bold">Wolfgang Borchert [A]</span> aus dem Jahr{' '}
                <span className="text-purple-600 font-bold">1946 [Z]</span> geht es um{' '}
                <span className="text-rose-600 font-bold">ein hungerndes Ehepaar, das sich gegenseitig belügt [T]</span>.“
              </span>
            )}
            {activeTemplateIdx === 1 && (
              <span>
                „Der <span className="text-emerald-600 font-bold">Jugendroman [T]</span>{' '}
                <span className="text-amber-600 font-bold">‚Die Wolke‘ [T]</span>, verfasst von{' '}
                <span className="text-blue-600 font-bold">Gudrun Pausewang [A]</span> im Jahr{' '}
                <span className="text-purple-600 font-bold">1987 [Z]</span>, thematisiert{' '}
                <span className="text-rose-600 font-bold">die Flucht eines Mädchens vor einer radioaktiven Wolke [T]</span>.“
              </span>
            )}
            {activeTemplateIdx === 2 && (
              <span>
                „Der Autor <span className="text-blue-600 font-bold">Franz Hohler [A]</span> schildert in seiner{' '}
                <span className="text-emerald-600 font-bold">Fabel [T]</span>{' '}
                <span className="text-amber-600 font-bold">‚Der Weltuntergang‘ [T]</span> aus dem Jahr{' '}
                <span className="text-purple-600 font-bold">1974 [Z]</span>, wie{' '}
                <span className="text-rose-600 font-bold">ein kleiner Käfer eine globale Kettenreaktion auslöst [T]</span>.“
              </span>
            )}
            {activeTemplateIdx === 3 && (
              <span>
                „In der im Jahr <span className="text-purple-600 font-bold">1811 [Z]</span> erschienenen{' '}
                <span className="text-emerald-600 font-bold">Kalendergeschichte [T]</span>{' '}
                <span className="text-amber-600 font-bold">‚Unverhofftes Wiedersehen‘ [T]</span> von{' '}
                <span className="text-blue-600 font-bold">Johann Peter Hebel [A]</span> steht{' '}
                <span className="text-rose-600 font-bold">die lebenslange Treue einer Braut [T]</span> im Mittelpunkt.“
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> T = Textsorte
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> A = Autor
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> T = Titel (in Anführungszeichen!)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> T = Thema (im Präsens!)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Z = Zeit / Erscheinungsjahr
            </span>
          </div>
        </div>
      </div>

      {/* Grammatik-Ecke für Klasse 7: Dativ & Geschlecht */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
            §
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Grammatik-Ecke: Dativ & grammatikalisches Geschlecht beachten!
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Ein sehr häufiger Fehler in Deutscharbeiten der 7. Klasse ist die falsche Präposition oder der falsche Artikel. 
          Wenn du mit <strong className="text-slate-900 dark:text-slate-100">„In...“</strong> beginnst, verlangt das Deutsche den <strong className="text-slate-900 dark:text-slate-100">Dativ</strong>:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Maskulinum */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2">
            <div className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center justify-between">
              <span>Maskulinum (der)</span>
              <span className="text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                In dem ...
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <em>der Jugendroman, der Roman, der Sachtext, der Zeitungsbericht</em>
            </p>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              ✓ Richtig: „<strong>In dem Jugendroman</strong> ‚Die Wolke‘...“
            </div>
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              ✗ Falsch: „In der Jugendroman...“
            </div>
          </div>

          {/* Femininum */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
            <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center justify-between">
              <span>Femininum (die)</span>
              <span className="text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded">
                In der ...
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <em>die Kurzgeschichte, die Fabel, die Kalendergeschichte, die Ballade</em>
            </p>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              ✓ Richtig: „<strong>In der Kurzgeschichte</strong> ‚Das Brot‘...“
            </div>
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              ✗ Falsch: „In dem Kurzgeschichte...“
            </div>
          </div>

          {/* Neutrum & Autorinnen */}
          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-2">
            <div className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center justify-between">
              <span>Neutrum & Autorinnen</span>
              <span className="text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">
                In dem / Die Autorin
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <em>das Gedicht, das Drama, das Märchen</em>
            </p>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              ✓ Richtig: „<strong>In dem Gedicht</strong>...“ &amp; „<strong>Die Autorin</strong> Gudrun Pausewang...“
            </div>
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              ✗ Falsch: „In der Gedicht...“ / „Der Autor Gudrun Pausewang“
            </div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            sound.playSuccess();
            onStartTraining();
          }}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all"
        >
          <span>Jetzt Lückentexte ausfüllen (Schritt 1)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

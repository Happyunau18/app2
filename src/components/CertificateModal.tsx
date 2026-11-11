import React, { useState } from 'react';
import { StudentSentenceEntry } from '../types';
import { X, Award, Printer, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { sound } from '../utils/sound';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  stars: number;
  completedTextsCount: number;
  savedSentences: StudentSentenceEntry[];
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  stars,
  completedTextsCount,
  savedSentences,
}) => {
  const [studentName, setStudentName] = useState<string>('Max / Mia');
  const [className, setClassName] = useState<string>('Klasse 7');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleCopySentences = () => {
    sound.playStar();
    const textToCopy = `=== MEIN TATTZ-SPICKZETTEL (Klasse 7) ===\nName: ${studentName} (${className})\nSterne gesammelt: ${stars} ★\n\nMeine formulierten TATTZ-Sätze:\n` +
      savedSentences.map((s, idx) => `${idx + 1}. ${s.textTitle}:\n   „${s.studentSentence}“`).join('\n\n') +
      `\n\nTATTZ-Formel Erinnerung:\nT = Textsorte | A = Autor | T = Titel | T = Thema (Präsens) | Z = Zeit`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Schließen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Printable Area */}
        <div id="printable-certificate" className="space-y-6 border-4 border-double border-indigo-200 dark:border-indigo-900/60 p-6 sm:p-8 rounded-2xl bg-indigo-50/20 dark:bg-slate-900/40 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Award className="w-9 h-9" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Offizielle Erfolgsurkunde · Deutschunterricht
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              TATTZ-Meister Klasse 7
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              für herausragende Fähigkeiten beim Verfassen des Einleitungssatzes einer Inhaltsangabe
            </p>
          </div>

          {/* Student Name & Class Editable Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                Vor- und Nachname:
              </label>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                Klasse / Schule:
              </label>
              <input
                type="text"
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Score & Milestones */}
          <div className="flex flex-wrap items-center justify-center gap-6 py-3 border-y border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 font-black text-base">★</span>
              <span>{stars} Sterne verdient</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{completedTextsCount} Lückentexte gelöst</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>{savedSentences.length} eigene Sätze formuliert</span>
            </div>
          </div>

          {/* Saved Sentences Collection */}
          <div className="text-left space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Gespeicherte TATTZ-Sätze des Schülers ({savedSentences.length}):
            </h3>

            {savedSentences.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-white dark:bg-slate-800/40 p-4 rounded-xl text-center">
                Du hast noch keine Sätze gespeichert. Wechsle zu Stufe 2 („Eigene Sätze bauen“) und klicke auf „Ins Zertifikat speichern“!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {savedSentences.map((s, idx) => (
                  <div
                    key={s.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>{idx + 1}. {s.textTitle}</span>
                      <span className="text-amber-500">{'★'.repeat(s.stars)}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 italic">„{s.studentSentence}“</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compact Cheat Sheet Footer */}
          <div className="bg-indigo-600 text-white p-3 rounded-xl text-xs font-medium space-y-1">
            <div className="font-bold">Die TATTZ-Formel immer griffbereit:</div>
            <div className="flex flex-wrap justify-center gap-3 text-[11px] opacity-95">
              <span><strong>T</strong> = Textsorte</span>
              <span>•</span>
              <span><strong>A</strong> = Autor</span>
              <span>•</span>
              <span><strong>T</strong> = Titel („...“)</span>
              <span>•</span>
              <span><strong>T</strong> = Thema (Präsens!)</span>
              <span>•</span>
              <span><strong>Z</strong> = Zeit</span>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Zurück zum Spiel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySentences}
              disabled={savedSentences.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kopiert!' : 'Text kopieren'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Drucken / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RuleLaboratory } from './components/RuleLaboratory';
import { GapFillTraining } from './components/GapFillTraining';
import { SentenceBuilder } from './components/SentenceBuilder';
import { CustomTextSandbox } from './components/CustomTextSandbox';
import { CertificateModal } from './components/CertificateModal';
import { ShareModal } from './components/ShareModal';
import { StudentSentenceEntry } from './types';
import { sound } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<'rules' | 'fill' | 'build' | 'custom'>('rules');
  const [stars, setStars] = useState<number>(() => {
    const saved = localStorage.getItem('tattz_stars');
    return saved ? Number(saved) : 0;
  });
  const [completedTexts, setCompletedTexts] = useState<string[]>(() => {
    const saved = localStorage.getItem('tattz_completed_texts');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedSentences, setSavedSentences] = useState<StudentSentenceEntry[]>(() => {
    const saved = localStorage.getItem('tattz_saved_sentences');
    return saved ? JSON.parse(saved) : [];
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  const sharedUrl = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
    ? window.location.origin
    : 'https://ais-pre-kltwp7oicls2otdinov4te-727505448237.europe-west1.run.app';

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('tattz_stars', stars.toString());
  }, [stars]);

  useEffect(() => {
    localStorage.setItem('tattz_completed_texts', JSON.stringify(completedTexts));
  }, [completedTexts]);

  useEffect(() => {
    localStorage.setItem('tattz_saved_sentences', JSON.stringify(savedSentences));
  }, [savedSentences]);

  const handleAddStars = (count: number) => {
    setStars(prev => prev + count);
  };

  const handleSaveSentence = (entry: StudentSentenceEntry) => {
    setSavedSentences(prev => {
      const filtered = prev.filter(s => s.textId !== entry.textId || s.id === entry.id);
      return [entry, ...filtered];
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stars={stars}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        savedCount={savedSentences.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'rules' && (
          <RuleLaboratory onStartTraining={() => setActiveTab('fill')} />
        )}

        {activeTab === 'fill' && (
          <GapFillTraining
            onNextStage={() => {
              setActiveTab('build');
              sound.playSuccess();
            }}
            onAddStars={handleAddStars}
            completedTexts={completedTexts}
            setCompletedTexts={setCompletedTexts}
          />
        )}

        {activeTab === 'build' && (
          <SentenceBuilder
            onAddStars={handleAddStars}
            onSaveSentence={handleSaveSentence}
            savedSentences={savedSentences}
          />
        )}

        {activeTab === 'custom' && (
          <CustomTextSandbox
            onAddStars={handleAddStars}
            onSaveSentence={handleSaveSentence}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">TATTZ-Meister</span>
            <span>·</span>
            <span>Interaktives Deutsch-Lernspiel für Klasse 7</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>T = Textsorte</span>
            <span>·</span>
            <span>A = Autor</span>
            <span>·</span>
            <span>T = Titel</span>
            <span>·</span>
            <span>T = Thema</span>
            <span>·</span>
            <span>Z = Zeit</span>
          </div>
        </div>
      </footer>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        stars={stars}
        completedTextsCount={completedTexts.length}
        savedSentences={savedSentences}
      />

      {/* Share / Student Link Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        sharedUrl={sharedUrl}
      />
    </div>
  );
}

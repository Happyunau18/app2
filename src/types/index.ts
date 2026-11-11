export type TattzKey = 'textsorte' | 'autor' | 'titel' | 'thema' | 'zeit';

export interface TattzElementInfo {
  letter: string;
  name: string;
  shortDesc: string;
  question: string;
  color: string;
  borderColor: string;
  bgLight: string;
  textColor: string;
  example: string;
  tip: string;
  commonMistake: string;
}

export interface PracticeText {
  id: string;
  textsorte: string;
  autor: string;
  titel: string;
  jahr: number | string;
  thema: string;
  kurzbeschreibung: string;
  // Gap fill level data
  sentenceTemplate: string; // e.g. "In der {textsorte} {titel} von {autor} aus dem Jahr {zeit} geht es um {thema}."
  leadIn?: string; // e.g. "In der", "In dem", "Die"
  connectorVerb?: string; // e.g. "geht es um", "handelt von", "thematisiert"
  options: {
    textsorte: string[];
    autor: string[];
    titel: string[];
    zeit: string[];
    thema: string[];
  };
  correctAnswers?: {
    textsorte: string;
    autor: string;
    titel: string;
    zeit: string;
    thema: string;
  };
  sampleSolution: string;
  alternateSolution: string;
}

export interface ErrorDetectiveTask {
  id: string;
  textTitle: string;
  originalInfo: {
    textsorte: string;
    autor: string;
    titel: string;
    jahr: string;
    thema: string;
  };
  faultySentence: string;
  errors: {
    element: TattzKey | 'stil' | 'grammatik';
    description: string;
    correction: string;
  }[];
  correctedSentence: string;
}

export interface EvaluationResult {
  tattzCoverage: {
    textsorte: boolean;
    autor: boolean;
    titel: boolean;
    thema: boolean;
    zeit: boolean;
  };
  praesensCheck: boolean;
  anfuehrungszeichenCheck: boolean;
  rating: 'perfekt' | 'gut' | 'fast_da';
  stars: number;
  praise: string;
  feedback: string;
  proTip: string;
}

export interface StudentSentenceEntry {
  id: string;
  textId: string;
  textTitle: string;
  studentSentence: string;
  timestamp: string;
  stars: number;
  rating: string;
}

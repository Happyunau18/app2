import { EvaluationResult, PracticeText } from '../types';
import { getTextsorteGrammar, getAuthorGrammar } from './grammar';

export interface ValidationStatus {
  hasTextsorte: boolean;
  hasAutor: boolean;
  hasTitel: boolean;
  hasQuotesAroundTitel: boolean;
  hasThemaSignal: boolean;
  hasZeit: boolean;
  hasPastTenseWarning: boolean;
  hasGrammarArticleWarning: boolean;
  elementsFoundCount: number;
  allComplete: boolean;
  tips: string[];
}

export function validateStudentSentence(sentence: string, text: PracticeText | {
  textsorte: string;
  autor: string;
  titel: string;
  jahr: string | number;
  thema: string;
}): ValidationStatus {
  const s = sentence.trim();
  const lower = s.toLowerCase();

  // 1. Textsorte detection
  const targetType = text.textsorte.toLowerCase();
  const knownTypes = [
    'kurzgeschichte',
    'fabel',
    'jugendroman',
    'roman',
    'kalendergeschichte',
    'parabel',
    'anekdote',
    'ballade',
    'gedicht',
    'sage',
    'märchen',
    'sachtext',
    'reportage',
    'erzählung',
  ];
  const hasTextsorte = lower.includes(targetType) || knownTypes.some(kt => lower.includes(kt));

  // 2. Autor detection
  const authorParts = text.autor.toLowerCase().split(/\s+/).filter(p => p.length > 2);
  const hasAutor = authorParts.length > 0 && authorParts.some(part => lower.includes(part));

  // 3. Titel & Quotes detection
  const targetTitle = text.titel.toLowerCase().replace(/['"„“»«]/g, '').trim();
  const hasTitleText = targetTitle.length > 0 && lower.includes(targetTitle);
  
  // Check for quotation marks around title or in the sentence
  const quoteRegex = /[„"»«]([^"“»«]+)[“"»«]/g;
  let hasQuotesAroundTitel = false;
  let match;
  while ((match = quoteRegex.exec(s)) !== null) {
    const quotedContent = match[1].toLowerCase().trim();
    if (quotedContent.includes(targetTitle) || targetTitle.includes(quotedContent)) {
      hasQuotesAroundTitel = true;
      break;
    }
  }
  // If no exact match inside quotes, check if any quotes exist and title exists
  if (!hasQuotesAroundTitel && /[„"»«].+?[“"»«]/.test(s) && hasTitleText) {
    hasQuotesAroundTitel = true;
  }
  const hasTitel = hasTitleText || hasQuotesAroundTitel;

  // 4. Zeit detection
  const yearStr = text.jahr.toString().toLowerCase();
  const hasZeit = lower.includes(yearStr) || /\b(1[789]\d\d|20\d\d)\b/.test(s) || (yearStr.includes('v. chr') && lower.includes('v. chr'));

  // 5. Thema / Present Tense Verbs
  const presentSignals = [
    'geht es um',
    'geht um',
    'handelt von',
    'thematisiert',
    'schildert',
    'beschreibt',
    'berichtet über',
    'berichtet von',
    'setzt sich auseinander',
    'kritisiert',
    'verdeutlicht',
    'zeigt',
    'beleuchtet',
    'erzählt von',
    'steht im mittelpunkt',
  ];
  const hasThemaSignal = presentSignals.some(sig => lower.includes(sig));

  // Check for past tense warning (common error in 7th grade)
  const pastSignals = [
    'handelte von',
    'ging es um',
    'ging um',
    'thematisierte',
    'schilderte',
    'beschrieb',
    'berichtete',
    'erzählte von',
    'zeigte',
    'war',
    'hatte',
    'erlebte',
    'litt',
  ];
  const hasPastTenseWarning = pastSignals.some(past => {
    // only warn if it appears as verb before or within theme
    const regex = new RegExp(`\\b${past}\\b`, 'i');
    return regex.test(s);
  });

  const tips: string[] = [];
  if (!hasTextsorte) tips.push(`Nenne die Textsorte (z. B. ${text.textsorte}).`);
  if (!hasAutor) tips.push(`Nenne den Verfasser bzw. die Verfasserin (${text.autor}).`);
  if (!hasTitleText) tips.push(`Vergiss den Titel nicht (${text.titel}).`);
  else if (!hasQuotesAroundTitel) tips.push(`Setze den Titel immer in Anführungszeichen: „${text.titel.replace(/['"„“»«]/g, '')}“!`);
  if (!hasZeit) tips.push(`Gib das Erscheinungsjahr bzw. die Entstehungszeit an (${text.jahr}).`);
  if (!hasThemaSignal) tips.push('Formuliere das Thema mit einem aktiven Verb (z. B. „thematisiert...“ oder „geht es um...“).');
  // Grammar check: Textsorte article & preposition
  const grammar = getTextsorteGrammar(text.textsorte);
  const authorGrammar = getAuthorGrammar(text.autor);
  let hasGrammarArticleWarning = false;

  if (grammar.gender === 'm' || grammar.gender === 'n') {
    // Check if user erroneously wrote "in der [masculine/neuter noun]" or "die [masculine noun]"
    const wrongPrepRegex = new RegExp(`\\bin\\s+der\\s+(${targetType}|roman|jugendroman|sachtext|gedicht)\\b`, 'i');
    const wrongArticleRegex = new RegExp(`\\bdie\\s+(${targetType}|roman|jugendroman|sachtext)\\b`, 'i');
    if (wrongPrepRegex.test(lower) || wrongArticleRegex.test(lower)) {
      hasGrammarArticleWarning = true;
      tips.push(`Grammatik-Tipp: Es heißt „${grammar.inDativ}“ (nicht „In der ${text.textsorte}“)!`);
    }
  } else if (grammar.gender === 'f') {
    // Check if user erroneously wrote "in dem [feminine noun]"
    const wrongPrepRegex = new RegExp(`\\bin\\s+dem\\s+(${targetType}|kurzgeschichte|fabel|parabel|kalendergeschichte)\\b`, 'i');
    if (wrongPrepRegex.test(lower)) {
      hasGrammarArticleWarning = true;
      tips.push(`Grammatik-Tipp: Bei weiblichen Textsorten heißt es „In der ${text.textsorte}“ (nicht „In dem“).`);
    }
  }

  // Check if author gender matches (e.g. "Der Autor Gudrun Pausewang")
  if (authorGrammar.label === 'Die Autorin' && /\bder\s+autor\b/i.test(s) && hasAutor) {
    tips.push(`Grammatik-Hinweis: Verwende bitte „Die Autorin ${text.autor}“ (weibliche Form).`);
  }

  const elementsFoundCount = [
    hasTextsorte,
    hasAutor,
    hasTitel && hasQuotesAroundTitel,
    hasThemaSignal,
    hasZeit,
  ].filter(Boolean).length;

  return {
    hasTextsorte,
    hasAutor,
    hasTitel,
    hasQuotesAroundTitel,
    hasThemaSignal,
    hasZeit,
    hasPastTenseWarning,
    hasGrammarArticleWarning,
    elementsFoundCount,
    allComplete: elementsFoundCount === 5 && !hasPastTenseWarning && !hasGrammarArticleWarning,
    tips,
  };
}

export function formatEvaluationFromValidation(val: ValidationStatus, text: PracticeText): EvaluationResult {
  const stars = val.allComplete ? 3 : val.elementsFoundCount >= 3 ? 2 : 1;
  const rating = stars === 3 ? 'perfekt' : stars === 2 ? 'gut' : 'fast_da';

  return {
    tattzCoverage: {
      textsorte: val.hasTextsorte,
      autor: val.hasAutor,
      titel: val.hasTitel && val.hasQuotesAroundTitel,
      thema: val.hasThemaSignal,
      zeit: val.hasZeit,
    },
    praesensCheck: !val.hasPastTenseWarning && val.hasThemaSignal,
    anfuehrungszeichenCheck: val.hasQuotesAroundTitel,
    rating,
    stars,
    praise: stars === 3
      ? 'Klasse gemacht! Alle 5 TATTZ-Elemente sind fehlerfrei vorhanden.'
      : stars === 2
      ? 'Schon sehr gut! Du hast fast alle Bausteine zusammen.'
      : 'Guter Anfang! Schau dir die Checkliste an, um den Satz zu vervollständigen.',
    feedback: val.tips.length === 0
      ? 'Dein Satz erfüllt alle Kriterien für einen sauberen Einleitungssatz in Klasse 7.'
      : val.tips.join(' '),
    proTip: stars === 3
      ? `Alternative Formulierung: „${text.alternateSolution}“`
      : 'Achte auf die Reihenfolge: T-A-T-T-Z hilft dir, an alles zu denken!',
  };
}

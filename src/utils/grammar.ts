/**
 * Helper utilities for accurate German grammar for text sorts and authors
 */

export interface TextsorteGrammar {
  gender: 'f' | 'm' | 'n';
  inDativ: string; // e.g. "In der Kurzgeschichte" vs "In dem Jugendroman" vs "In dem Gedicht"
  prepositionDativ: string; // "In der" vs "In dem"
  nominativArtikel: string; // "Die Kurzgeschichte" vs "Der Jugendroman" vs "Das Gedicht"
  definiteArticle: string; // "Die" vs "Der" vs "Das"
}

export function getTextsorteGrammar(textsorte: string): TextsorteGrammar {
  const lower = textsorte.toLowerCase().trim();

  // Masculine nouns: der Roman, der Jugendroman, der Sachtext, der Bericht, der Zeitungsbericht
  if (
    lower.includes('roman') ||
    lower.includes('sachtext') ||
    lower.includes('bericht') ||
    lower.includes('auszug') ||
    (lower.includes('text') && !lower.includes('geschichte'))
  ) {
    return {
      gender: 'm',
      inDativ: `In dem ${textsorte}`,
      prepositionDativ: 'In dem',
      nominativArtikel: `Der ${textsorte}`,
      definiteArticle: 'Der',
    };
  }

  // Neuter nouns: das Gedicht, das Drama, das Märchen, das Theaterstück
  if (
    lower.includes('gedicht') ||
    lower.includes('drama') ||
    lower.includes('märchen') ||
    lower.includes('stück')
  ) {
    return {
      gender: 'n',
      inDativ: `In dem ${textsorte}`,
      prepositionDativ: 'In dem',
      nominativArtikel: `Das ${textsorte}`,
      definiteArticle: 'Das',
    };
  }

  // Feminine nouns: die Kurzgeschichte, die Fabel, die Kalendergeschichte, die Parabel, die Anekdote, die Ballade, die Erzählung, die Sage
  return {
    gender: 'f',
    inDativ: `In der ${textsorte}`,
    prepositionDativ: 'In der',
    nominativArtikel: `Die ${textsorte}`,
    definiteArticle: 'Die',
  };
}

export function getAuthorGrammar(autor: string): {
  label: string; // "Der Autor" vs "Die Autorin"
  pronoun: string; // "seiner" vs "ihrer"
  possessive: string; // "seiner / seiner" vs "ihrer / ihrer"
} {
  const lower = autor.toLowerCase().trim();
  const femaleNames = [
    'gudrun',
    'marie luise',
    'marie-luise',
    'ilse',
    'ingeborg',
    'christa',
    'cornelia',
    'astrid',
    'sarah',
    'clara',
    'janna',
    'anna',
    'hannah',
    'julia',
    'elena',
    'miriam',
    'sophie',
    'laura',
    'anette',
    'droste',
  ];

  const isFemale = femaleNames.some(fn => lower.includes(fn));

  return {
    label: isFemale ? 'Die Autorin' : 'Der Autor',
    pronoun: isFemale ? 'ihrer' : 'seiner',
    possessive: isFemale ? 'ihrer' : 'seiner',
  };
}

import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini client with aistudio-build telemetry header
const rawApiKey = process.env.GEMINI_API_KEY;
const hasValidApiKey = Boolean(rawApiKey && rawApiKey !== 'MY_GEMINI_API_KEY' && rawApiKey.trim().length > 10);
let ai: GoogleGenAI | null = null;
if (hasValidApiKey && rawApiKey) {
  ai = new GoogleGenAI({
    apiKey: rawApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Route: AI-powered TATTZ sentence evaluator for 7th grade German
app.post('/api/check-tattz', async (req, res) => {
  const { sentence, textInfo } = req.body;

  if (!sentence || typeof sentence !== 'string') {
    return res.status(400).json({ error: 'Satz fehlt oder ist ungültig.' });
  }

  // Fallback heuristic evaluator if no API key is available or if AI service errors
  const evaluateHeuristically = () => {
    const s = sentence.trim();
    const hasQuotes = /[„"»«].+?[“"»«]/.test(s) || (textInfo?.titel && s.includes(textInfo.titel));
    const hasAuthor = textInfo?.autor ? s.toLowerCase().includes(textInfo.autor.toLowerCase().split(' ').pop() || '') : false;
    const hasType = textInfo?.textsorte ? s.toLowerCase().includes(textInfo.textsorte.toLowerCase()) : false;
    const hasYear = textInfo?.jahr ? s.includes(textInfo.jahr.toString()) : false;
    
    // Check present tense verbs commonly used in German summaries
    const presentTenseWords = [
      'geht es um',
      'geht um',
      'handelt von',
      'thematisiert',
      'schildert',
      'beschreibt',
      'erzählt von',
      'berichtet über',
      'berichtet von',
      'verdeutlicht',
      'zeigt',
      'setzt sich auseinander',
      'beleuchtet',
      'steht im mittelpunkt',
    ];
    const hasPresentTense = presentTenseWords.some((w) => s.toLowerCase().includes(w));
    
    // Check for common grammatical article and gender mismatches
    const wrongInDerMatch = /\bin\s+der\s+(jugendroman|roman|sachtext|bericht|gedicht|drama|märchen)\b/i.test(s);
    const wrongInDemMatch = /\bin\s+dem\s+(kurzgeschichte|fabel|parabel|kalendergeschichte|ballade|sage)\b/i.test(s);
    const wrongAuthorGender = /\bder\s+autor\s+(gudrun|marie|ilse|ingeborg|christa|astrid|cornelia)/i.test(s);

    const count = [hasQuotes, hasAuthor, hasType, hasYear, hasPresentTense].filter(Boolean).length;
    const hasGrammarFlaw = wrongInDerMatch || wrongInDemMatch || wrongAuthorGender;
    const stars = count >= 5 && !hasGrammarFlaw ? 3 : count >= 3 ? 2 : 1;

    let rating: 'perfekt' | 'gut' | 'fast_da' = 'fast_da';
    if (stars === 3) rating = 'perfekt';
    else if (stars === 2) rating = 'gut';

    const feedbackPoints: string[] = [];
    if (!hasType) feedbackPoints.push('Die Textsorte fehlt noch oder ist nicht klar benannt.');
    if (!hasAuthor) feedbackPoints.push('Der Name des Autors bzw. der Autorin fehlt noch.');
    if (!hasQuotes) feedbackPoints.push('Der Titel sollte immer in Anführungszeichen („...“) gesetzt werden.');
    if (!hasYear) feedbackPoints.push('Die Jahreszahl bzw. Entstehungszeit fehlt.');
    if (!hasPresentTense) feedbackPoints.push('Achte darauf, das Thema im Präsens zu formulieren (z. B. mit „thematisiert“ oder „geht es um“).');
    if (wrongInDerMatch) feedbackPoints.push('Grammatik-Fehler: Es heißt „In dem Jugendroman“ / „In dem Gedicht“ (Dativ Maskulinum/Neutrum), niemals „In der Jugendroman“!');
    if (wrongInDemMatch) feedbackPoints.push('Grammatik-Fehler: Bei weiblichen Textsorten heißt es „In der Kurzgeschichte“ / „In der Fabel“, nicht „In dem“!');
    if (wrongAuthorGender) feedbackPoints.push('Grammatik-Hinweis: Verwende bei Schriftstellerinnen die weibliche Form: „Die Autorin“!');

    return {
      tattzCoverage: {
        textsorte: hasType,
        autor: hasAuthor,
        titel: hasQuotes,
        thema: hasPresentTense,
        zeit: hasYear,
      },
      praesensCheck: hasPresentTense,
      anfuehrungszeichenCheck: hasQuotes,
      rating,
      stars,
      praise: stars === 3 
        ? 'Hervorragend! Dein Satz enthält alle 5 TATTZ-Elemente und ist grammatikalisch super aufgebaut.'
        : stars === 2
        ? 'Schon richtig gut! Du hast die meisten TATTZ-Elemente sicher im Griff.'
        : 'Guter Anfang! Mit ein paar Ergänzungen wird dein TATTZ-Satz komplett.',
      feedback: feedbackPoints.length === 0
        ? 'Alle Pflichtangaben für eine Inhaltsangabe in Klasse 7 sind vorhanden!'
        : feedbackPoints.join(' '),
      proTip: stars === 3
        ? 'Profi-Tipp: Verwende abwechslungsreiche Verben wie „thematisiert“, „beleuchtet“ oder „schildert“, um noch stilsicherer zu klingen.'
        : 'Tipp für die 7. Klasse: Achte auf die Grammatik (z. B. „In dem Jugendroman“, nicht „In der Jugendroman“) und das Präsens!',
    };
  };

  if (!ai) {
    return res.json(evaluateHeuristically());
  }

  try {
    const prompt = `Du bist ein freundlicher, motivierender Deutschlehrer für die 7. Klasse an einer deutschen Schule (Gymnasium/Realschule).
Deine Aufgabe ist es, den TATTZ-Einleitungssatz eines Schülers für eine Inhaltsangabe zu bewerten.

Vorgegebene Textdaten:
- Textsorte: ${textInfo?.textsorte || 'Nicht vorgegeben'}
- Autor/Autorin: ${textInfo?.autor || 'Nicht vorgegeben'}
- Titel: ${textInfo?.titel || 'Nicht vorgegeben'}
- Entstehungszeit/Jahr: ${textInfo?.jahr || 'Nicht vorgegeben'}
- Kerninhalt/Thema: ${textInfo?.thema || 'Nicht vorgegeben'}

Vom Schüler geschriebener TATTZ-Satz:
"${sentence}"

Prüfe nach den TATTZ-Kriterien für Klasse 7:
1. T - Textsorte genannt? (z.B. Kurzgeschichte, Fabel, Jugendroman etc.)
2. A - Autor/Autorin genannt? (Achte bei weiblichen Autoren wie Gudrun Pausewang darauf, dass 'Die Autorin' verwendet wird)
3. T - Titel genannt UND in deutsche Anführungszeichen gesetzt? (z.B. „Titel“ oder "Titel")
4. T - Thema des Textes im Präsens (Gegenwart) formuliert? (Wichtig: kein Nacherzählen, sondern Kernproblem)
5. Z - Zeit / Erscheinungsjahr / Entstehungszeit genannt?
6. Grammatikalische Korrektheit (sehr wichtig für Klasse 7):
   - Stimmt das grammatikalische Geschlecht im Dativ?
     * Maskulin: 'In dem Jugendroman' / 'In dem Sachtext' (FEHLER: 'In der Jugendroman' ist falsch!)
     * Neutrum: 'In dem Gedicht' / 'In dem Drama'
     * Feminin: 'In der Kurzgeschichte' / 'In der Fabel'
   - Ist der Satz ein flüssiger, vollständiger Hauptsatz?

Formuliere dein Feedback kindgerecht, ermutigend und klar auf Deutsch für einen 12-13-jährigen Schüler.`;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timeout')), 6500)
    );

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tattzCoverage: {
              type: Type.OBJECT,
              properties: {
                textsorte: { type: Type.BOOLEAN, description: 'Textsorte korrekt vorhanden' },
                autor: { type: Type.BOOLEAN, description: 'Autor/Autorin vorhanden' },
                titel: { type: Type.BOOLEAN, description: 'Titel vorhanden' },
                thema: { type: Type.BOOLEAN, description: 'Thema treffend beschrieben' },
                zeit: { type: Type.BOOLEAN, description: 'Zeit/Erscheinungsjahr vorhanden' },
              },
              required: ['textsorte', 'autor', 'titel', 'thema', 'zeit'],
            },
            praesensCheck: { type: Type.BOOLEAN, description: 'Thema im Präsens formuliert' },
            anfuehrungszeichenCheck: { type: Type.BOOLEAN, description: 'Titel steht in Anführungszeichen' },
            rating: { type: Type.STRING, enum: ['perfekt', 'gut', 'fast_da'] },
            stars: { type: Type.INTEGER, description: '1 bis 3 Sterne' },
            praise: { type: Type.STRING, description: 'Kurzes, herzliches Lob für den Schüler' },
            feedback: { type: Type.STRING, description: 'Konkrete Erklärung, was super ist und was noch fehlt' },
            proTip: { type: Type.STRING, description: 'Ein schöner Stil- oder Formulierungstipp für Klasse 7' },
          },
          required: ['tattzCoverage', 'praesensCheck', 'anfuehrungszeichenCheck', 'rating', 'stars', 'praise', 'feedback', 'proTip'],
        },
      },
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const result = JSON.parse(response.text || '{}');
    return res.json(result);
  } catch (error) {
    console.error('Gemini check error, falling back to heuristic:', error);
    return res.json(evaluateHeuristically());
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const distHtmlPath = path.resolve(__dirname, 'dist', 'index.html');
  const distExists = fs.existsSync(distHtmlPath);

  if (process.env.NODE_ENV === 'production' && distExists) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(distHtmlPath);
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TATTZ-Meister server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

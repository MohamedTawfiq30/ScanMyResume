import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

// ========== PDF EXTRACTION ==========

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text;
}

// ========== KEYWORD EXTRACTION ==========

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by','from',
  'is','are','was','were','be','been','being','have','has','had','do','does','did',
  'will','would','could','should','may','might','shall','can','need','i','me','my',
  'we','our','you','your','he','him','his','she','her','it','its','they','them','their',
  'what','which','who','whom','this','that','these','those','am','if','because','as',
  'until','while','about','against','between','through','during','before','after',
  'above','below','up','down','out','off','over','under','again','further','then',
  'once','here','there','when','where','why','how','all','both','each','few','more',
  'most','other','some','such','no','nor','not','only','own','same','so','than','too',
  'very','just','don','now','also','etc','using','used','use','new','one','two','work',
  'working','well','make','making','get','getting','into','per','via',
]);

export function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().replace(/[^a-z0-9\s+#.-]/g, ' ').split(/\s+/);
  const freq: Record<string, number> = {};
  for (const w of words) {
    const clean = w.replace(/^[.-]+|[.-]+$/g, '');
    if (clean.length > 2 && !STOP_WORDS.has(clean)) {
      freq[clean] = (freq[clean] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word]) => word);
}

// ========== FORMATTING CHECK ==========

export function checkFormatting(text: string): string[] {
  const issues: string[] = [];
  if (!/education/i.test(text)) issues.push('Missing "Education" section');
  if (!/experience|work|employment/i.test(text)) issues.push('Missing "Experience" section');
  if (!/skills/i.test(text)) issues.push('Missing "Skills" section');
  if (!/email|@/i.test(text)) issues.push('Missing email address');
  if (!/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\+\d/.test(text)) issues.push('Missing phone number');
  if (/\t/.test(text)) issues.push('Tab characters detected (may break ATS)');
  if (text.length < 200) issues.push('Resume appears too short');
  if (text.length > 12000) issues.push('Resume may be too long');
  if (/[│║─═┌┐└┘├┤┬┴┼]/.test(text)) issues.push('Table/box characters detected');
  if (/[\u2022\u2023\u25E6\u2043\u2219]/.test(text)) issues.push('Special bullet characters (use standard • or -)');
  return issues;
}

// ========== GRAMMAR CHECK ==========

export function checkGrammar(text: string): string[] {
  const issues: string[] = [];

  const passiveRegex = /\b(was|were|been|being|is|are)\s+(being\s+)?\w+ed\b/gi;
  const passiveMatches = text.match(passiveRegex);
  if (passiveMatches && passiveMatches.length > 3) {
    issues.push(`${passiveMatches.length} passive voice instances. Use active voice.`);
  }

  const weaselWords = /\b(very|really|quite|basically|actually|practically|virtually|somewhat|fairly|rather|slightly)\b/gi;
  const weaselMatches = text.match(weaselWords);
  if (weaselMatches && weaselMatches.length > 2) {
    issues.push(`${weaselMatches.length} weasel words found. Be more specific.`);
  }

  const repeatedWord = /\b(\w{3,})\s+\1\b/gi;
  const repeatedMatches = text.match(repeatedWord);
  if (repeatedMatches) {
    issues.push(`${repeatedMatches.length} repeated word(s) detected.`);
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 40);
  if (longSentences.length > 0) {
    issues.push(`${longSentences.length} very long sentence(s). Break them up.`);
  }

  return issues;
}

// ========== SECTION COMPLETENESS ==========

export function checkSectionCompleteness(text: string) {
  return [
    { name: 'Contact Info', present: /email|@|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\+\d/i.test(text) },
    { name: 'Summary', present: /summary|objective|profile|about\s*me/i.test(text) },
    { name: 'Education', present: /education|university|college|degree|bachelor|master|gpa/i.test(text) },
    { name: 'Experience', present: /experience|work|employment|intern/i.test(text) },
    { name: 'Skills', present: /skills|technologies|proficienc|competenc/i.test(text) },
    { name: 'Projects', present: /projects|portfolio/i.test(text) },
    { name: 'Certifications', present: /certification|certificate|certified|license/i.test(text) },
  ];
}

// ========== KEYWORD MATCHING ==========

export function computeKeywordMatch(resumeKeywords: string[], jdKeywords: string[]) {
  const resumeSet = new Set(resumeKeywords);
  const matched = jdKeywords.filter(k => resumeSet.has(k));
  const missing = jdKeywords.filter(k => !resumeSet.has(k));
  const score = jdKeywords.length > 0 ? matched.length / jdKeywords.length : 0;
  return { score, missing, matched };
}

// ========== SCORING ==========

export function computeATSScore(formattingCount: number, grammarCount: number, sectionScore: number): number {
  let score = 100;
  score -= formattingCount * 8;
  score -= grammarCount * 5;
  score -= (1 - sectionScore) * 30;
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ========== RESULT TYPES ==========

export interface ATSResult {
  score: number;
  formattingIssues: string[];
  grammarIssues: string[];
  sections: { name: string; present: boolean }[];
  keywords: string[];
  suggestions: string[];
}

export interface JDMatchResult extends ATSResult {
  matchScore: number;
  missingKeywords: string[];
  similarityScore: number;
  keywordMatchScore: number;
  radarData: { category: string; score: number }[];
}

// ========== ANALYZE RESUME ONLY ==========

export function analyzeResume(text: string): ATSResult {
  const formattingIssues = checkFormatting(text);
  const grammarIssues = checkGrammar(text);
  const sections = checkSectionCompleteness(text);
  const keywords = extractKeywords(text);

  const sectionScore = sections.filter(s => s.present).length / sections.length;
  const score = computeATSScore(formattingIssues.length, grammarIssues.length, sectionScore);

  const suggestions: string[] = [];
  if (score < 50) suggestions.push('Resume needs major improvements for ATS.');
  if (!sections.find(s => s.name === 'Skills')?.present) suggestions.push('Add a Skills section with relevant keywords.');
  if (!sections.find(s => s.name === 'Summary')?.present) suggestions.push('Add a professional summary.');
  if (!sections.find(s => s.name === 'Projects')?.present) suggestions.push('Add a Projects section to showcase work.');
  if (formattingIssues.length > 3) suggestions.push('Fix formatting issues for better ATS parsing.');
  if (grammarIssues.length > 0) suggestions.push('Review and fix grammar issues.');
  if (keywords.length < 10) suggestions.push('Add more industry-specific keywords.');
  if (suggestions.length === 0) suggestions.push('Resume looks solid! Keep refining keywords.');

  return { score, formattingIssues, grammarIssues, sections, keywords, suggestions };
}

// ========== ANALYZE WITH JD ==========

export function analyzeWithJD(resumeText: string, jdText: string, similarityScore: number): JDMatchResult {
  const baseResult = analyzeResume(resumeText);
  const resumeKeywords = extractKeywords(resumeText);
  const jdKeywords = extractKeywords(jdText);
  const { score: keywordMatchScore, missing } = computeKeywordMatch(resumeKeywords, jdKeywords);

  const matchScore = Math.round((0.6 * similarityScore + 0.4 * keywordMatchScore) * 100);

  const sectionScore = baseResult.sections.filter(s => s.present).length / baseResult.sections.length;

  const radarData = [
    { category: 'Keywords', score: Math.round(keywordMatchScore * 100) },
    { category: 'Similarity', score: Math.round(similarityScore * 100) },
    { category: 'Format', score: Math.max(0, 100 - baseResult.formattingIssues.length * 15) },
    { category: 'Sections', score: Math.round(sectionScore * 100) },
    { category: 'Grammar', score: Math.max(0, 100 - baseResult.grammarIssues.length * 20) },
  ];

  const suggestions = [...baseResult.suggestions];
  if (missing.length > 0) {
    suggestions.unshift(`Add missing keywords: ${missing.slice(0, 8).join(', ')}`);
  }

  return {
    ...baseResult,
    matchScore,
    missingKeywords: missing,
    similarityScore,
    keywordMatchScore,
    radarData,
  };
}

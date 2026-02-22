import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import PixelMeter from "@/components/PixelMeter";
import PixelRadarChart from "@/components/PixelRadarChart";
import {
  ResultSection,
  IssueList,
  SectionChecklist,
  LoadingOverlay,
  KeywordTags,
} from "@/components/ResultComponents";
import { extractTextFromPDF, analyzeWithJD, type JDMatchResult } from "@/lib/ats-engine";
import { getEmbedding, cosineSimilarity } from "@/lib/embeddings";

const ResumeWithJD = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Analyzing...");
  const [result, setResult] = useState<JDMatchResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!file || !jdText.trim()) return;
    setAnalyzing(true);
    setError("");
    setResult(null);

    try {
      setLoadingMsg("Extracting resume text...");
      const resumeText = await extractTextFromPDF(file);
      if (resumeText.trim().length < 20) {
        throw new Error("Could not extract readable text from PDF.");
      }

      let similarity = 0;
      try {
        setLoadingMsg("Loading AI model...");
        const [resumeEmb, jdEmb] = await Promise.all([
          getEmbedding(resumeText),
          getEmbedding(jdText),
        ]);
        similarity = cosineSimilarity(resumeEmb, jdEmb);
        similarity = Math.max(0, Math.min(1, (similarity - 0.2) / 0.6));
      } catch (e) {
        console.warn("AI model failed, using keyword-only matching:", e);
        similarity = 0.5;
      }

      setLoadingMsg("Computing match score...");
      const res = analyzeWithJD(resumeText, jdText, similarity);
      setResult(res);
    } catch (e: any) {
      setError(e.message || "Failed to analyze.");
    }
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen ag-grid-bg">
      {analyzing && <LoadingOverlay message={loadingMsg} />}

      {/* Header */}
      <header className="p-5 border-b border-foreground/[0.06]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <h1 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
            ATS + Job Match
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8 ag-fade-up">
          <div>
            <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Resume PDF</div>
            <FileUpload file={file} onFile={setFile} />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Job Description</div>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the job description here..."
              className="ag-input min-h-[180px] resize-none"
              rows={8}
            />
          </div>
        </div>

        {error && (
          <div className="ag-glass-static p-4 mb-6">
            <div className="text-sm text-foreground/80">⚠ {error}</div>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!file || !jdText.trim() || analyzing}
          className={`w-full mb-10 ag-btn-primary text-sm py-3.5 px-6 ag-fade-up-d1 cursor-pointer ${
            !file || !jdText.trim() ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          {analyzing ? "Analyzing..." : "Check Match"}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-5 ag-fade-up">
            {/* Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <PixelMeter score={result.matchScore} label="Job Match" />
              <PixelMeter score={result.score} label="ATS Score" />
            </div>

            {/* Similarity metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="ag-glass-static p-6">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                  Embedding Similarity
                </div>
                <div className="text-3xl font-bold text-foreground font-mono mt-2">
                  {Math.round(result.similarityScore * 100)}%
                </div>
                <div className="text-xs text-muted-foreground/50 mt-2">
                  AI semantic similarity
                </div>
              </div>
              <div className="ag-glass-static p-6">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                  Keyword Match
                </div>
                <div className="text-3xl font-bold text-foreground font-mono mt-2">
                  {Math.round(result.keywordMatchScore * 100)}%
                </div>
                <div className="text-xs text-muted-foreground/50 mt-2">
                  Keywords found in resume
                </div>
              </div>
            </div>

            <PixelRadarChart data={result.radarData} />

            <ResultSection title="Missing Keywords">
              {result.missingKeywords.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  All JD keywords found in resume ✓
                </div>
              ) : (
                <KeywordTags keywords={result.missingKeywords} variant="missing" />
              )}
            </ResultSection>

            <ResultSection title="Formatting Issues">
              <IssueList items={result.formattingIssues} emptyMessage="No formatting issues ✓" />
            </ResultSection>

            <ResultSection title="Grammar Issues">
              <IssueList items={result.grammarIssues} emptyMessage="No grammar issues ✓" />
            </ResultSection>

            <ResultSection title="Section Completeness">
              <SectionChecklist sections={result.sections} />
            </ResultSection>

            <ResultSection title="Suggestions">
              <IssueList items={result.suggestions} emptyMessage="Looking great!" />
            </ResultSection>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResumeWithJD;
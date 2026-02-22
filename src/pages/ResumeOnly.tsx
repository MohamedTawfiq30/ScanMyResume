import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import PixelMeter from "@/components/PixelMeter";
import {
  ResultSection,
  IssueList,
  SectionChecklist,
  LoadingOverlay,
  KeywordTags,
} from "@/components/ResultComponents";
import { extractTextFromPDF, analyzeResume, type ATSResult } from "@/lib/ats-engine";

const ResumeOnly = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError("");
    setResult(null);
    try {
      const text = await extractTextFromPDF(file);
      if (text.trim().length < 20) {
        throw new Error("Could not extract readable text from PDF.");
      }
      const res = analyzeResume(text);
      setResult(res);
    } catch (e: any) {
      setError(e.message || "Failed to analyze PDF.");
    }
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen ag-grid-bg">
      {analyzing && <LoadingOverlay message="Analyzing your resume..." />}

      {/* Header */}
      <header className="p-5 border-b border-foreground/[0.06]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <h1 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
            ATS Checker
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Upload */}
        <div className="mb-8 ag-fade-up">
          <FileUpload file={file} onFile={setFile} />

          {error && (
            <div className="ag-glass-static p-4 mt-4">
              <div className="text-sm text-foreground/80">⚠ {error}</div>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!file || analyzing}
            className={`w-full mt-4 ag-btn-primary text-sm py-3.5 px-6 cursor-pointer ${
              !file ? "opacity-30 cursor-not-allowed" : ""
            }`}
          >
            {analyzing ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-5 ag-fade-up">
            <PixelMeter score={result.score} label="ATS Score" />

            <ResultSection title="Formatting Issues">
              <IssueList items={result.formattingIssues} emptyMessage="No formatting issues ✓" />
            </ResultSection>

            <ResultSection title="Grammar Issues">
              <IssueList items={result.grammarIssues} emptyMessage="No grammar issues ✓" />
            </ResultSection>

            <ResultSection title="Section Completeness">
              <SectionChecklist sections={result.sections} />
            </ResultSection>

            <ResultSection title="Extracted Keywords">
              <KeywordTags keywords={result.keywords} />
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

export default ResumeOnly;
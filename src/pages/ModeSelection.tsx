import { Link } from "react-router-dom";
import { FileSearch, GitCompareArrows } from "lucide-react";

const ModeSelection = () => {
  return (
    <div className="min-h-screen ag-grid-bg flex flex-col items-center justify-center p-6">
      {/* Title */}
      <div className="text-center ag-fade-up">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
          ScanMyResume
        </h1>
        <div className="w-12 h-px bg-foreground/10 mx-auto mt-5 mb-5" />
        <p className="text-sm text-muted-foreground font-medium tracking-wide">
          Free ATS Checker for Students
        </p>
        <p className="text-xs text-muted-foreground/50 mt-2 tracking-widest uppercase font-mono">
          No Login · No Cost · No API Keys
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl mt-16 ag-fade-up-d1">
        <Link to="/ats-resume-only" className="block flex-1 group">
          <div className="ag-glass p-8 sm:p-10 text-center h-full transition-transform duration-300 group-hover:scale-[1.02]">
            <div className="w-10 h-10 mx-auto mb-5 rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center group-hover:border-foreground/[0.12] transition-colors">
              <FileSearch className="w-5 h-5 text-foreground/60 group-hover:text-foreground/90 transition-colors" />
            </div>
            <div className="text-base font-semibold text-foreground mb-2">ATS Checker</div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Upload resume · Get ATS score
            </div>
          </div>
        </Link>

        <Link to="/ats-with-jd" className="block flex-1 group">
          <div className="ag-glass p-8 sm:p-10 text-center h-full transition-transform duration-300 group-hover:scale-[1.02]">
            <div className="w-10 h-10 mx-auto mb-5 rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center group-hover:border-foreground/[0.12] transition-colors">
              <GitCompareArrows className="w-5 h-5 text-foreground/60 group-hover:text-foreground/90 transition-colors" />
            </div>
            <div className="text-base font-semibold text-foreground mb-2">ATS + Job Match</div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Resume + Job Description · Match score
            </div>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-20 text-center ag-fade-up-d2">
        <p className="text-[11px] text-muted-foreground/40 tracking-wider uppercase font-mono">
          AI-Powered · Runs in Your Browser · 100% Private
        </p>
      </div>
    </div>
  );
};

export default ModeSelection;
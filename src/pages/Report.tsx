import { Home, ChevronRight, FileText } from "lucide-react";

export default function ReportPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Report</h1>
          <p className="page-subtitle">Generate and view reports</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Home className="w-4 h-4" />
          <span>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Report</span>
        </div>
      </div>

      <div className="card-section animate-fade-in">
        <div className="flex flex-col items-center justify-center py-16">
          <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Reports Coming Soon
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            Generate comprehensive reports for your devices including daily, weekly, 
            and monthly summaries of power consumption and performance metrics.
          </p>
        </div>
      </div>
    </div>
  );
}

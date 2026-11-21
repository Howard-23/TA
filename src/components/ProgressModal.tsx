"use client";

type Props = {
  show: boolean;
  percent: number;
  message: string;
  subMessage?: string;
  status?: "running" | "success" | "error";
};

export default function ProgressModal({ show, percent, message, subMessage, status = "running" }: Props) {
  if (!show) return null;
  const barColor = status === "success" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-blue-500 progress-bar-animated";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-blue-600 text-white px-4 py-3 flex items-center gap-2">
          {status === "running" && (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          <h5 className="font-semibold">{status === "success" ? "Completed" : status === "error" ? "Error" : "Processing Request"}</h5>
        </div>
        <div className="p-6 text-center">
          <div className="h-8 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div className={`h-full ${barColor} transition-all duration-300 flex items-center justify-center text-white text-sm font-medium`} style={{ width: `${Math.min(100, Math.round(percent))}%` }}>
              {Math.round(percent)}%
            </div>
          </div>
          <p className={status === "success" ? "text-green-600 font-medium" : status === "error" ? "text-red-600 font-medium" : "text-gray-600"}>{message}</p>
          {subMessage && <p className="text-sm text-blue-600 mt-1">{subMessage}</p>}
        </div>
      </div>
    </div>
  );
}

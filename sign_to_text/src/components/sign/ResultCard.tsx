import { SignResult } from "@/lib/sign-schema";

interface ResultCardProps {
  result: SignResult;
  className?: string;
}

export default function ResultCard({ result, className = "" }: ResultCardProps) {
  return (
    <div className={`rounded-2xl border p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-2">Recognized Sign</h3>
      <p className="text-2xl font-bold text-blue-600">{result.label}</p>
      <p className="text-sm text-muted-foreground mt-1">
        Confidence: {(result.confidence * 100).toFixed(1)}%
      </p>
      {result.timestamp && (
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(result.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

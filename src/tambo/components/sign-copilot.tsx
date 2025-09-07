"use client";

import { SignResponse } from "@/lib/sign-schema";
import { downloadText, downloadJSON } from "@/lib/download";

type Props = { data: SignResponse };

export default function SignCopilotComponent({ data }: Props) {
  const handleExportJSON = () => {
    downloadJSON("sign-log.json", data);
  };

  const handleExportTXT = () => {
    const content = `${data.recognized.label} (${(data.recognized.confidence * 100).toFixed(1)}% confidence)\n\n` +
      `Meaning: ${data.explanation.meaning}\n\n` +
      (data.explanation.context ? `Context:\n${data.explanation.context.map(c => `• ${c}`).join('\n')}\n\n` : '') +
      (data.explanation.suggestions ? `Suggestions:\n${data.explanation.suggestions.map(s => `• ${s}`).join('\n')}` : '');
    downloadText("sign-log.txt", content);
  };

  return (
    <div className="grid gap-4">
      <section className="rounded-2xl border p-4 bg-blue-50 border-blue-200">
        <h2 className="text-lg font-semibold text-blue-900">Recognized Sign</h2>
        <p className="mt-2 text-2xl font-bold text-blue-700">{data.recognized.label}</p>
        <p className="text-sm text-blue-600 mt-1">
          Confidence: {(data.recognized.confidence * 100).toFixed(1)}%
        </p>
        {data.recognized.timestamp && (
          <p className="text-xs text-blue-500 mt-1">
            {new Date(data.recognized.timestamp).toLocaleString()}
          </p>
        )}
      </section>

      {data.alternatives && data.alternatives.length > 0 && (
        <section className="rounded-2xl border p-4">
          <h3 className="font-medium mb-2">Alternative Interpretations</h3>
          <div className="space-y-2">
            {data.alternatives.map((alt, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="font-medium">{alt.label}</span>
                <span className="text-sm text-muted-foreground">
                  {(alt.confidence * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border p-4">
        <h3 className="font-medium mb-2">Meaning</h3>
        <p className="text-gray-700">{data.explanation.meaning}</p>
        
        {data.explanation.context && data.explanation.context.length > 0 && (
          <>
            <h3 className="font-medium mt-4 mb-2">Context</h3>
            <ul className="list-disc pl-5 space-y-1">
              {data.explanation.context.map((c, i) => (
                <li key={i} className="text-gray-700">{c}</li>
              ))}
            </ul>
          </>
        )}
        
        {data.explanation.suggestions && data.explanation.suggestions.length > 0 && (
          <>
            <h3 className="font-medium mt-4 mb-2">Suggestions</h3>
            <ul className="list-disc pl-5 space-y-1">
              {data.explanation.suggestions.map((s, i) => (
                <li key={i} className="text-gray-700">{s}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="rounded-2xl border p-4">
        <h3 className="font-medium mb-3">Export Recognition Data</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={handleExportTXT}
            className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Export TXT
          </button>
        </div>
      </section>
    </div>
  );
}

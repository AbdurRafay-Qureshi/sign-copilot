// download.ts
export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; 
  a.download = filename; 
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(filename: string, data: any) {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; 
  a.download = filename; 
  a.click();
  URL.revokeObjectURL(url);
}

export function formatSignLog(data: any, format: 'txt' | 'json' = 'txt'): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }
  
  // Format as readable text
  const timestamp = new Date().toISOString();
  const confidence = (data.recognized.confidence * 100).toFixed(1);
  return `${timestamp}: ${data.recognized.label} (${confidence}% confidence)`;
}

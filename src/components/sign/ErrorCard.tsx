export default function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border p-4 bg-red-50 text-red-700 border-red-200">
      <div className="font-semibold">Sign recognition failed</div>
      <div className="text-sm mt-1">{message}</div>
    </div>
  );
}

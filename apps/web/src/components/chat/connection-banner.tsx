export function ConnectionBanner({ connected }: { connected: boolean }) {
  if (connected) return null;
  return (
    <div className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
      Reconnecting to chat server...
    </div>
  );
}

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-m-6 flex h-[calc(100vh)] flex-col overflow-hidden bg-slate-950 text-white">
      {children}
    </div>
  );
}

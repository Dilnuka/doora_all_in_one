export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-m-6 flex h-[calc(100vh)] flex-col overflow-hidden">{children}</div>
  );
}

"use client";

export default function TaskDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container relative mx-auto mt-10 flex min-w-[375px] max-w-[1280px] flex-col items-center gap-4 rounded-lg border bg-background px-12 py-4 shadow-sm max-md:px-4">
      {children}
    </div>
  );
}

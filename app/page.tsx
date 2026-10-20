import { Suspense } from "react";

import { GamesSection } from "@/components/games/games-section";

function GamesSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-md bg-surface">
          <div className="aspect-[4/3] animate-pulse bg-border" />

          <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 animate-pulse rounded-sm bg-border" />
            <div className="h-4 w-1/2 animate-pulse rounded-sm bg-border" />
            <div className="h-4 w-full animate-pulse rounded-sm bg-border" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <p className="text-sm font-medium text-accent">دنیای بازی‌ها، یک‌جا</p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          کاوشگر بازی‌ها
        </h1>

        <p className="max-w-2xl text-muted">
          از میان بازی‌های متنوع کشف کنید، آمارشان را مقایسه کنید و ماجراجویی
          بعدی خود را پیدا کنید.
        </p>
      </header>

      <section aria-label="فهرست بازی‌ها" className="space-y-5">
        <Suspense fallback={<GamesSkeleton />}>
          <GamesSection />
        </Suspense>
      </section>
    </main>
  );
}

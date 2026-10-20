
import { Suspense } from "react";

import { GamesSkeleton } from "@/components/games/games-skeleton";
import { GamesSection } from "@/components/games/games-section";

type HomeProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

async function PaginatedGames({
  searchParams,
}: HomeProps) {
  const params = await searchParams;
  const parsedPage = Number(params.page);

  const pageId =
    params.page &&
    Number.isSafeInteger(parsedPage) &&
    parsedPage > 0
      ? parsedPage
      : 1;

  return <GamesSection pageId={pageId} />;
}

export default function Home({ searchParams }: HomeProps) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <p className="text-sm font-medium text-accent">
          دنیای بازی‌ها، یک‌جا
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          کاوشگر بازی‌ها
        </h1>

        <p className="max-w-2xl text-muted">
          از میان بازی‌های متنوع کاوش کنید، آمارشان را مقایسه کنید و ماجراجویی
          بعدی خود را پیدا کنید.
        </p>
      </header>

      <section aria-label="فهرست بازی‌ها" className="space-y-5">
        <Suspense fallback={<GamesSkeleton />}>
          <PaginatedGames searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}

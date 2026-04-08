"use client";

import { startTransition, useEffect, useState } from "react";

type WeatherData = {
  city: string;
  country: string;
  temperature: number;
  time: string;
  timezone: string;
  condition: string;
  isDay: boolean;
};

type WeatherState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: WeatherData };

const RAIN_DROPS = Array.from({ length: 60 }, (_, index) => ({
  id: index,
  left: `${((index * 37) % 100) + ((index % 4) * 0.35)}%`,
  duration: `${1.45 + ((index * 17) % 9) * 0.09}s`,
  delay: `${(index % 12) * -0.28}s`,
  opacity: 0.22 + (index % 5) * 0.08,
}));

function formatLocalTime(isoTime: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(isoTime));
}

function WeatherScene() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.08),transparent_14%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_52%)]" />
      <div className="absolute left-[51%] top-[18%] h-14 w-14 -translate-x-1/2 rounded-full bg-[rgba(183,177,163,0.42)] blur-[1px]" />
      <div className="absolute left-0 right-0 top-[40%] h-[46%] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)] opacity-40" />
      <div
        className="absolute left-[-12%] top-[14%] h-[58%] w-[46%] bg-[linear-gradient(180deg,rgba(60,66,69,0.92),rgba(28,31,26,0.98))]"
        style={{
          clipPath: "polygon(0 100%, 18% 66%, 30% 44%, 45% 20%, 64% 0, 78% 28%, 100% 100%)",
        }}
      />
      <div
        className="absolute right-[-14%] top-[16%] h-[54%] w-[48%] bg-[linear-gradient(180deg,rgba(73,78,74,0.88),rgba(32,35,29,0.98))]"
        style={{
          clipPath: "polygon(0 100%, 12% 62%, 30% 36%, 56% 14%, 71% 26%, 84% 18%, 100% 100%)",
        }}
      />
      <div
        className="absolute left-[18%] top-[26%] h-[52%] w-[58%] bg-[linear-gradient(180deg,rgba(118,120,116,0.68),rgba(49,50,46,0.92))]"
        style={{
          clipPath: "polygon(0 100%, 12% 74%, 28% 55%, 47% 28%, 62% 42%, 72% 35%, 89% 18%, 100% 100%)",
        }}
      />
      <div
        className="absolute bottom-[13%] left-[5%] h-[24%] w-[34%] bg-[linear-gradient(180deg,rgba(17,19,18,0.96),rgba(10,12,12,1))]"
        style={{
          clipPath: "polygon(0 100%, 8% 78%, 14% 84%, 22% 52%, 29% 84%, 36% 62%, 43% 84%, 50% 45%, 58% 84%, 66% 64%, 74% 86%, 80% 54%, 89% 82%, 100% 100%)",
        }}
      />
      <div
        className="absolute bottom-[13%] right-[3%] h-[24%] w-[37%] bg-[linear-gradient(180deg,rgba(17,19,18,0.96),rgba(10,12,12,1))]"
        style={{
          clipPath: "polygon(0 100%, 6% 70%, 14% 84%, 22% 50%, 30% 82%, 38% 58%, 46% 84%, 55% 46%, 64% 83%, 74% 56%, 83% 82%, 91% 60%, 100% 100%)",
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-[26%] bg-[linear-gradient(180deg,rgba(31,34,27,0.34),rgba(12,13,12,0.96))]" />
      <div className="absolute bottom-[12%] left-0 right-0 h-[12%] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))] opacity-40" />
      <div className="absolute inset-x-[8%] bottom-[16%] h-[12%] rounded-full bg-[rgba(255,255,255,0.06)] blur-2xl" />
      {RAIN_DROPS.map((drop) => (
        <span
          key={drop.id}
          className="rain-drop"
          style={
            {
              left: drop.left,
              opacity: drop.opacity,
              "--fall-duration": drop.duration,
              "--fall-delay": drop.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

function LoadingState() {
  return (
    <>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="loading-sheen h-5 w-14 rounded-full" />
          <div className="loading-sheen h-5 w-20 rounded-full" />
        </div>
        <div className="loading-sheen h-[4.6rem] w-20 rounded-2xl" />
      </div>
      <div className="space-y-2">
        <div className="loading-sheen h-5 w-24 rounded-full" />
        <div className="loading-sheen h-5 w-16 rounded-full" />
      </div>
    </>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <>
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-[0.18em] text-white/70 uppercase">
          Weather offline
        </p>
        <p className="max-w-[14rem] text-sm leading-6 text-white/86">{message}</p>
      </div>
      <div className="space-y-2">
        <p className="text-[2.75rem] leading-none font-black tracking-[-0.08em]">
          --
        </p>
        <p className="text-sm font-semibold text-white/72">Chengdu, China</p>
      </div>
    </>
  );
}

function SuccessState({ data }: { data: WeatherData }) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-[-0.01em] text-white/92">
            Today
          </p>
          <p className="text-lg font-semibold tracking-[-0.01em] text-white/92">
            {formatLocalTime(data.time, data.timezone)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[4.5rem] leading-[0.9] font-black tracking-[-0.08em] text-white">
            {data.temperature}°
          </p>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[1.15rem] leading-5 font-semibold tracking-[-0.02em] text-white/95">
            {data.city}
          </p>
          <p className="text-[1.15rem] leading-5 font-semibold tracking-[-0.02em] text-white/95">
            {data.country}
          </p>
        </div>
        <p className="max-w-[7rem] text-right text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/66">
          {data.condition}
        </p>
      </div>
    </>
  );
}

export function WeatherWidget() {
  const [state, setState] = useState<WeatherState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeather() {
      try {
        const response = await fetch("/api/weather", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { message?: string };
          throw new Error(errorData.message ?? "Unable to load Chengdu weather.");
        }

        const data = (await response.json()) as WeatherData;
        startTransition(() => {
          setState({ status: "success", data });
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load Chengdu weather.",
        });
      }
    }

    loadWeather();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <section
        aria-label="Live Chengdu weather widget"
        className="weather-card relative aspect-square w-full max-w-[400px] overflow-hidden rounded-[16px] border border-white/10 px-8 py-8 text-white"
      >
        <WeatherScene />
        <div className="relative z-10 flex h-full flex-col justify-between">
          {state.status === "loading" && <LoadingState />}
          {state.status === "error" && <ErrorState message={state.message} />}
          {state.status === "success" && <SuccessState data={state.data} />}
        </div>
      </section>
      <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/42">
        Open-Meteo live weather for Chengdu
      </p>
    </div>
  );
}

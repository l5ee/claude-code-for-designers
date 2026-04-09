"use client";

import Image from "next/image";
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

const LOFOTEN_IMAGE =
  "https://www.figma.com/api/mcp/asset/0839140c-d74a-40c1-85b9-b98345dad1d9";

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
      <Image
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        fill
        sizes="(max-width: 640px) 100vw, 400px"
        src={LOFOTEN_IMAGE}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,11,12,0.02),rgba(9,11,12,0.14)_62%,rgba(9,11,12,0.28)_100%)]" />
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

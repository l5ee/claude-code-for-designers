import { NextResponse } from "next/server";

type OpenMeteoResponse = {
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    weather_code?: number;
    is_day?: number;
  };
};

const CHENGDU = {
  city: "Chengdu",
  country: "China",
  latitude: "30.5728",
  longitude: "104.0668",
  timezone: "Asia/Shanghai",
};

const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Heavy showers",
  82: "Violent showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm hail",
  99: "Severe hail",
};

function buildWeatherUrl() {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: CHENGDU.latitude,
    longitude: CHENGDU.longitude,
    current: "temperature_2m,weather_code,is_day",
    timezone: CHENGDU.timezone,
    forecast_days: "1",
  }).toString();
  return url.toString();
}

export async function GET() {
  try {
    const response = await fetch(buildWeatherUrl(), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo returned ${response.status}.`);
    }

    const data = (await response.json()) as OpenMeteoResponse;
    const current = data.current;

    if (!current?.time || typeof current.temperature_2m !== "number") {
      throw new Error("Open-Meteo returned incomplete weather data.");
    }

    return NextResponse.json({
      city: CHENGDU.city,
      country: CHENGDU.country,
      temperature: Math.round(current.temperature_2m),
      time: current.time,
      timezone: data.timezone ?? CHENGDU.timezone,
      condition: WEATHER_CODES[current.weather_code ?? -1] ?? "Live weather",
      isDay: Boolean(current.is_day),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load Chengdu weather.",
      },
      { status: 500 },
    );
  }
}

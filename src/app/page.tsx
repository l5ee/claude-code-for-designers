import { WeatherWidget } from "@/components/weather-widget";

export default function Home() {
  return (
    <main className="weather-shell flex min-h-screen items-center justify-center px-4 py-10">
      <WeatherWidget />
    </main>
  );
}

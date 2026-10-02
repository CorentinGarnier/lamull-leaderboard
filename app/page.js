import Hero from "@/components/Hero";
import Leaderboard from "@/components/Leaderboard";
import { config } from "@/config";

export default function Page() {
  return (
    <>
      <header className="top"><span className="logo">{config.streamer.toUpperCase()}<i>.</i></span></header>
      <Hero />
      <Leaderboard />
    </>
  );
}
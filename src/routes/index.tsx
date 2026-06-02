import { createFileRoute } from "@tanstack/react-router";
import bg from "@/assets/shadow-district-bg.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shadow District" },
      { name: "description", content: "Shadow District — a pixel art story game about chasing success from a tiny dirty room in the slums." },
      { property: "og:title", content: "Shadow District" },
      { property: "og:description", content: "A pixel art story game. Start your journey from the shadows." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black"
      style={{ imageRendering: "pixelated" }}
    >
      <img
        src={bg}
        alt="Pixel art cat in hoodie sitting at an old computer in a dirty apartment"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ imageRendering: "pixelated" }}
      />
      {/* vignette / darkening */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />

      <div className="relative z-10 flex w-full flex-col items-center px-6 pt-10 sm:pt-16">
        <h1
          className="text-center font-['Press_Start_2P'] text-4xl leading-tight tracking-tight text-[#7fe7ff] sm:text-6xl md:text-7xl lg:text-8xl"
          style={{
            textShadow:
              "0 0 12px rgba(127,231,255,0.55), 4px 4px 0 #0a1a26, 8px 8px 0 rgba(0,0,0,0.6)",
          }}
        >
          SHADOW
          <br />
          DISTRICT
        </h1>

        <div className="mt-auto" />
      </div>

      <div className="absolute bottom-16 left-1/2 z-10 -translate-x-1/2 sm:bottom-24">
        <button
          type="button"
          className="group relative font-['Press_Start_2P'] text-xl sm:text-2xl text-[#0a1016] bg-[#7fe7ff] px-10 py-5 border-4 border-[#0a1016] shadow-[6px_6px_0_0_#0a1016] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0_0_#0a1016] hover:bg-[#a8f1ff]"
          style={{ imageRendering: "pixelated" }}
        >
          ИГРАТЬ
        </button>
      </div>

      {/* scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-20 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0 2px, transparent 2px 4px)",
        }}
      />
    </main>
  );
}

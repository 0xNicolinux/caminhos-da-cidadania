import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Caminhos da Cidadania — SENAI • Energisa" },
      { name: "description", content: "Jogo educativo retrô sobre cidadania, proteção, segurança e participação social." },
      { property: "og:title", content: "Caminhos da Cidadania — o espetáculo" },
      { property: "og:description", content: "Um jogo educativo em pixel art sobre direitos, proteção e políticas públicas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/game.html"
      title="Caminhos da Cidadania"
      allow="fullscreen; autoplay"
      allowFullScreen
      className="fixed inset-0 h-full w-full border-0 bg-background"
    />
  );
}

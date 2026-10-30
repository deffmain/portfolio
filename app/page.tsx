import { ViewTransition } from "react";
import { SiteHeader } from "@/components/site-header";
import { Estudos, Hero, Processo, Sobre } from "@/components/home";
import { HeliceSolucoes } from "@/components/helice";
import { Contato } from "@/components/contato";
import { CommandPalette } from "@/components/command-palette";

export default function Home() {
  return (
    <>
      <SiteHeader />
      {/* Ao abrir um projeto a home some rápido; ao voltar, reaparece. */}
      <ViewTransition
        exit={{ "abrir-projeto": "home-sai", default: "none" }}
        enter={{ "voltar-projeto": "home-entra", default: "none" }}
        default="none"
      >
        <div>
          <main>
            <Hero />
            <HeliceSolucoes />
            <Estudos />
            <Processo />
            <Sobre />
          </main>
          <Contato />
        </div>
      </ViewTransition>
      <CommandPalette />
    </>
  );
}

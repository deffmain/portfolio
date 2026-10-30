import { SiteHeader } from "@/components/site-header";
import { Estudos, Hero, Processo, Sobre } from "@/components/home";
import { HeliceSolucoes } from "@/components/helice";
import { Contato } from "@/components/contato";
import { CommandPalette } from "@/components/command-palette";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <HeliceSolucoes />
        <Estudos />
        <Processo />
        <Sobre />
      </main>
      <Contato />
      <CommandPalette />
    </>
  );
}

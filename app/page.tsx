import { SiteHeader } from "@/components/app/landing/SiteHeader";
import { Hero } from "@/components/app/landing/Hero";
import { Problem } from "@/components/app/landing/Problem";
import { Agitation } from "@/components/app/landing/Agitation";
import { Solution } from "@/components/app/landing/Solution";
import { AppInside } from "@/components/app/landing/AppInside";
import { TrustBar } from "@/components/app/landing/TrustBar";
import { Offer } from "@/components/app/landing/Offer";
import { Guarantee } from "@/components/app/landing/Guarantee";
import { Faq } from "@/components/app/landing/Faq";
import { FinalCta } from "@/components/app/landing/FinalCta";
import { FooterLegal } from "@/components/app/landing/FooterLegal";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <Agitation />
        <Solution />
        <AppInside />
        <TrustBar />
        <Offer />
        <Guarantee />
        <Faq />
        <FinalCta />
      </main>
      <FooterLegal />
    </>
  );
}

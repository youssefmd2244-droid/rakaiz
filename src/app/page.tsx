"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { ServicesSection } from "@/components/ServicesSection";
import { AchievementsSection } from "@/components/AchievementsSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { PartnersSection } from "@/components/PartnersSection";
import { CertificatesSection } from "@/components/CertificatesSection";
import { ContractsSection } from "@/components/ContractsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { FloatingContactButtons } from "@/components/FloatingContactButtons";
import { RequestQuoteModal } from "@/components/RequestQuoteModal";
import { Preloader } from "@/components/Preloader";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SiteBlocks } from "@/components/SiteBlocks";
import { sanitizeSiteMedia } from "@/lib/site-content";

export default function HomePage() {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    // Fetch public site settings and trigger DB verification
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error("Error loading settings:", err));
  }, []);

  return (
    <div className="relative min-h-screen bg-ink text-fg selection:bg-gold selection:text-on-gold">
      {/* Premium Cinematic Logo Preloader */}
      {loadingInitial && <Preloader onComplete={() => setLoadingInitial(false)} />}

      {/* 3D scroll-reveal entrance for every section (starts after the preloader) */}
      <ScrollReveal ready={!loadingInitial} />

      {/* Main Glass Header */}
      <Header onOpenQuote={() => setQuoteModalOpen(true)} />

      {/* Hero Section */}
      <Hero
        onOpenQuote={() => setQuoteModalOpen(true)}
        onOpenContact={() => {
          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
        }}
        stats={settings?.general?.heroStats}
        media={settings?.site_media ? sanitizeSiteMedia(settings.site_media) : null}
      />
      <SiteBlocks zone="after:hero" data={settings?.site_blocks} />

      {/* About & Corporate Vision/Mission */}
      <AboutSection
        galleryData={settings?.about_gallery}
        media={settings?.site_media ? sanitizeSiteMedia(settings.site_media) : null}
      />
      <SiteBlocks zone="after:about" data={settings?.site_blocks} />

      {/* Comprehensive Services (9 services from profile) */}
      <ServicesSection />
      <SiteBlocks zone="after:services" data={settings?.site_blocks} />

      {/* Key Achievements Timeline (2021, 2023, 2024) */}
      <AchievementsSection />
      <SiteBlocks zone="after:achievements" data={settings?.site_blocks} />

      {/* Selected Case Studies & Projects */}
      <ProjectsSection />
      <SiteBlocks zone="after:projects" data={settings?.site_blocks} />

      {/* Success Partners Infinite Marquee */}
      <PartnersSection />
      <SiteBlocks zone="after:partners" data={settings?.site_blocks} />

      {/* Certificates & Licenses with Verifiable Status */}
      <CertificatesSection />
      <SiteBlocks zone="after:certificates" data={settings?.site_blocks} />

      {/* Protected Contracts Section */}
      <ContractsSection />
      <SiteBlocks zone="after:contracts" data={settings?.site_blocks} />

      {/* Contact Section */}
      <ContactSection
        contactData={settings?.contact}
        media={settings?.site_media ? sanitizeSiteMedia(settings.site_media) : null}
      />
      <SiteBlocks zone="after:contact" data={settings?.site_blocks} />

      {/* Luxury Charcoal Footer */}
      <Footer contactData={settings?.contact} iconCodeData={settings?.iconcode} iconCodeShowcase={settings?.iconcode_showcase} />

      {/* Floating Independent WhatsApp & Call Buttons */}
      <FloatingContactButtons
        whatsapp={settings?.contact?.whatsappPrimary || "01094555299"}
        phone={settings?.contact?.phonePrimary || "01094555299"}
        whatsappEnabled={settings?.contact?.floatingButtons?.whatsappEnabled ?? true}
        callEnabled={settings?.contact?.floatingButtons?.callEnabled ?? true}
      />

      {/* Multi-step Request a Quote Modal */}
      <RequestQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
      />
    </div>
  );
}

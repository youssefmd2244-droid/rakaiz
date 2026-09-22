"use client";

import React from "react";
import { IconCodeShowcase } from "./IconCodeShowcase";
import { ShowcaseSettings } from "@/lib/iconcode-showcase";

interface SiteBlocksProps {
  /** e.g. "after:hero", "after:about" ... */
  zone: string;
  data?: ShowcaseSettings | null;
}

/**
 * Renders any admin-added custom sections placed in a given zone
 * (site_settings key "site_blocks"). Renders nothing when there is
 * no visible content for that zone, so it never leaves an empty gap.
 */
export const SiteBlocks: React.FC<SiteBlocksProps> = ({ zone, data }) => {
  if (!data || !Array.isArray(data.sections)) return null;
  const sections = data.sections.filter((s) => (s.zone || "after:about") === zone);
  if (sections.length === 0) return null;

  return (
    <section className="relative py-16 sm:py-20 bg-ink border-t border-line-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <IconCodeShowcase data={{ sections }} className="relative space-y-12" />
      </div>
    </section>
  );
};

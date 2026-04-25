import type { Metadata } from 'next';
import LaunchRoutePage from '@/components/incubator/LaunchRoutePage';
import { incubatorUrl } from '@/lib/incubator-paths';

export const metadata: Metadata = {
  title: 'Vibe Code | BrainSAIT Incubator',
  description: 'Move from idea to prototype with BrainSAIT startup automation, product architecture, and the linked SDK workspace at sdk.elfadil.com.',
  alternates: { canonical: incubatorUrl('/vibe-code') },
};

export default function VibeCodePage() {
  return (
    <LaunchRoutePage
      badge="Vibe Code"
      title="Prototype fast, structure the stack, and keep momentum high."
      description="Vibe Code is the incubator route for founders who want rapid product shaping, system architecture clarity, and a direct bridge into templates, repos, automation, and the live SDK workspace."
      actions={[
        { label: 'Open SDK workspace', href: 'https://sdk.elfadil.com', external: true },
        { label: 'Open automation flow', href: '/startup/automate' },
        { label: 'Browse projects', href: '/projects' },
      ]}
      highlights={[
        {
          title: 'Rapid product framing',
          description: 'Translate founder intent into implementation-ready project structure, repo planning, and operating workflows.',
        },
        {
          title: 'Automation-first build',
          description: 'Use BrainSAIT templates and GitHub automation to reduce setup time and keep teams focused on shipping.',
        },
        {
          title: 'SDK-connected workspace',
          description: 'Jump from the incubator route into sdk.elfadil.com for a live builder surface connected to the broader product workflow.',
        },
        {
          title: 'Founder velocity',
          description: 'Tie code momentum back to mentorship, compliance, and launch readiness instead of treating product work as an isolated track.',
        },
      ]}
    />
  );
}

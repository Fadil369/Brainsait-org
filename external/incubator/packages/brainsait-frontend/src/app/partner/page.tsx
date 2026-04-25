import type { Metadata } from 'next';
import LaunchRoutePage from '@/components/incubator/LaunchRoutePage';
import { incubatorUrl } from '@/lib/incubator-paths';

export const metadata: Metadata = {
  title: 'Partner Route | BrainSAIT Incubator',
  description: 'Enter the BrainSAIT partner network, pilot opportunities, and ecosystem collaboration route.',
  alternates: { canonical: incubatorUrl('/partner') },
};

export default function PartnerRoutePage() {
  return (
    <LaunchRoutePage
      badge="Partner Route"
      title="Activate the BrainSAIT partner network from one route."
      description="Use this partner entry point to move into the full partners hub, explore pilot pathways, and connect with the healthcare ecosystem around the incubator."
      actions={[
        { label: 'Open partner route', href: '/partner' },
        { label: 'Apply to incubator', href: '/apply' },
      ]}
      highlights={[
        {
          title: 'Pilot pathways',
          description: 'Match startups with hospitals, clinics, technology providers, and distribution partners ready for real-world validation.',
        },
        {
          title: 'Ecosystem access',
          description: 'Surface the investor, integration, and regional rollout conversations that matter once a company is ready to scale.',
        },
        {
          title: 'Program fit',
          description: 'Use this route as a clean singular entry while preserving the full partners content under the existing partners hub.',
        },
      ]}
    />
  );
}

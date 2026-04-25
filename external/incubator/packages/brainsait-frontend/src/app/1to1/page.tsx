import type { Metadata } from 'next';
import { incubatorUrl } from '@/lib/incubator-paths';
import OneToOneClient from '@/components/incubator/OneToOneClient';

export const metadata: Metadata = {
  title: '1:1 Sessions | BrainSAIT Incubator',
  description: 'Book direct founder support across mentorship, product strategy, compliance, and healthcare market execution.',
  alternates: { canonical: incubatorUrl('/1to1') },
};

export default function OneToOnePage() {
  return <OneToOneClient />;
}

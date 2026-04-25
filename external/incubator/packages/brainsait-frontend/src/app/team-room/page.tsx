import type { Metadata } from 'next';
import { incubatorUrl } from '@/lib/incubator-paths';
import TeamRoomClient from '@/components/incubator/team-room/TeamRoomClient';

export const metadata: Metadata = {
  title: 'Team Room | BrainSAIT Incubator',
  description: 'Real-time workspace for startup teams — live chat, presence, and video coordination inside the BrainSAIT incubator.',
  alternates: { canonical: incubatorUrl('/team-room') },
};

export default function TeamRoomPage() {
  return <TeamRoomClient />;
}

export type IncubatorNavItem = {
  label: string;
  href: string;
};

export type IncubatorHomeRoute = IncubatorNavItem & {
  description: string;
};

export const incubatorPrimaryNav: IncubatorNavItem[] = [
  { label: 'Programs', href: '/apply' },
  { label: 'Mentorship', href: '/mentorship' },
  { label: 'Team Room', href: '/team-room' },
  { label: 'Partners', href: '/partner' },
];

export const incubatorSecondaryNav: IncubatorNavItem[] = [
  { label: 'Courses', href: '/courses' },
  { label: 'Resources', href: '/resources' },
  { label: 'Projects', href: '/projects' },
  { label: 'App Store', href: '/app-store' },
  { label: 'Vibe Code', href: '/vibe-code' },
  { label: '1:1', href: '/1to1' },
  { label: 'Portal Entry', href: '/portal' },
];

export const incubatorFooterNav: IncubatorNavItem[] = [
  incubatorPrimaryNav[1],
  incubatorPrimaryNav[3],
  incubatorSecondaryNav[0],
  incubatorSecondaryNav[1],
  incubatorSecondaryNav[3],
];

export const incubatorHomeRoutes: IncubatorHomeRoute[] = [
  {
    label: 'Courses',
    href: '/courses',
    description: 'Open the incubator course hub for cohort-based learning and healthcare execution tracks.',
  },
  {
    label: 'App Store',
    href: '/app-store',
    description: 'Launch BrainSAIT apps, starter kits, and product surfaces already connected to the program.',
  },
  {
    label: 'Mentorship',
    href: '/mentorship',
    description: 'Access mentor coordination, expert sessions, and founder support workflows.',
  },
  {
    label: 'Partners',
    href: '/partner',
    description: 'Connect with pilot pathways, implementation alliances, and ecosystem collaboration.',
  },
  {
    label: 'Team Room',
    href: '/team-room',
    description: 'Use the shared workspace route for invitations, coordination, and execution continuity.',
  },
  {
    label: 'Vibe Code',
    href: '/vibe-code',
    description: 'Move from concept to prototype with the incubator’s automation-first build route.',
  },
  {
    label: 'Resources',
    href: '/resources',
    description: 'Open templates, contracts, workshops, and shared program materials in one library.',
  },
  {
    label: '1:1',
    href: '/1to1',
    description: 'Book focused founder support on product, compliance, GTM, and venture readiness.',
  },
];

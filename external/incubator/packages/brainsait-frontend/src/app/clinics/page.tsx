import type { Metadata } from 'next';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  LocalHospital,
  MonitorHeart,
  OpenInNew,
  Payments,
  VerifiedUser,
} from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'Clinics Hub — BrainSAIT Incubator',
  description:
    'BrainSAIT Clinics: AI-powered clinic management, NPHIES billing, and patient care tools purpose-built for Saudi healthcare clinics.',
};

const features = [
  {
    icon: <LocalHospital sx={{ fontSize: 32, color: '#0ea5e9' }} />,
    title: 'Clinic Management Suite',
    description:
      'Appointment scheduling, patient records, staff rostering, and digital consultation notes in one unified interface.',
  },
  {
    icon: <Payments sx={{ fontSize: 32, color: '#0ea5e9' }} />,
    title: 'NPHIES Billing & RCM',
    description:
      'Automated claim creation, eligibility checks, and real-time payer submissions through the NPHIES gateway.',
  },
  {
    icon: <MonitorHeart sx={{ fontSize: 32, color: '#0ea5e9' }} />,
    title: 'Clinical Analytics',
    description:
      'Live dashboards for AR aging, denial rates, appointment utilisation, and patient satisfaction metrics.',
  },
  {
    icon: <VerifiedUser sx={{ fontSize: 32, color: '#0ea5e9' }} />,
    title: 'Compliance & Audit',
    description:
      'PDPL-aligned patient data governance, full audit trails, and automated MOH reporting templates.',
  },
];

const plans = [
  {
    name: 'Solo Clinic',
    price: 'SAR 299 / mo',
    highlight: false,
    features: ['1 physician', 'NPHIES billing', 'Basic scheduling', 'SMS reminders'],
  },
  {
    name: 'Group Practice',
    price: 'SAR 799 / mo',
    highlight: true,
    features: ['Up to 10 physicians', 'Full RCM suite', 'Analytics dashboard', 'Priority support'],
  },
  {
    name: 'Polyclinic',
    price: 'Contact us',
    highlight: false,
    features: ['Unlimited physicians', 'Multi-branch support', 'Custom integrations', 'Dedicated CSM'],
  },
];

export default function ClinicsPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="/">BrainSAIT</Link>
          <Link underline="hover" color="inherit" href="/incubator">Incubator</Link>
          <Typography color="text.primary">Clinics</Typography>
        </Breadcrumbs>

        {/* Hero */}
        <Card
          sx={{
            borderRadius: 5,
            overflow: 'hidden',
            mb: 5,
            background: 'linear-gradient(135deg, #0b1d2e 0%, #0f3460 55%, #0ea5e9 100%)',
            color: 'white',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 6 } }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<LocalHospital />}
                label="Clinic Management"
                sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }}
              />
              <Chip
                icon={<VerifiedUser />}
                label="NPHIES + FHIR R4"
                sx={{ bgcolor: 'rgba(14,165,233,0.25)', color: '#bae6fd' }}
              />
            </Stack>
            <Typography variant="h3" fontWeight={800} sx={{ color: 'white', maxWidth: 820, mb: 2 }}>
              AI-powered clinic operations for Saudi healthcare providers.
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: 'rgba(255,255,255,0.76)', maxWidth: 740, fontWeight: 400, mb: 4 }}
            >
              From appointment booking to NPHIES claim submission and payment reconciliation —
              BrainSAIT Clinics gives your team a single command centre aligned to Vision 2030.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                href="https://clinics.brainsait.org"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNew />}
                sx={{ bgcolor: '#0ea5e9', '&:hover': { bgcolor: '#0284c7' } }}
              >
                Open Clinics Portal
              </Button>
              <Button
                variant="outlined"
                href="/incubator/apply"
                endIcon={<ArrowForward />}
                sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
              >
                Apply for Incubation
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Features */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          What&apos;s included
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {features.map((f) => (
            <Grid item xs={12} md={6} key={f.title}>
              <Card sx={{ height: '100%', borderRadius: 4 }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Box sx={{ mb: 2 }}>{f.icon}</Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pricing */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Pricing
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.name}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  border: plan.highlight ? '2px solid #0ea5e9' : undefined,
                  boxShadow: plan.highlight ? '0 0 0 4px rgba(14,165,233,0.12)' : undefined,
                }}
              >
                <CardContent sx={{ p: 3.5 }}>
                  {plan.highlight && (
                    <Chip label="Most popular" size="small" color="primary" sx={{ mb: 2 }} />
                  )}
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ mb: 2, color: '#0ea5e9' }}>
                    {plan.price}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {plan.features.map((feat) => (
                      <Typography component="li" variant="body2" color="text.secondary" key={feat} sx={{ mb: 0.5 }}>
                        {feat}
                      </Typography>
                    ))}
                  </Box>
                  <Button
                    variant={plan.highlight ? 'contained' : 'outlined'}
                    href="https://clinics.brainsait.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                    sx={{ mt: 3 }}
                    endIcon={<OpenInNew />}
                  >
                    {plan.price === 'Contact us' ? 'Talk to us' : 'Get started'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA */}
        <Card sx={{ borderRadius: 4, bgcolor: 'action.hover' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Ready to modernise your clinic?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Join hundreds of Saudi healthcare providers already running on BrainSAIT Clinics.
            </Typography>
            <Button
              variant="contained"
              href="https://clinics.brainsait.org"
              target="_blank"
              rel="noopener noreferrer"
              size="large"
              endIcon={<OpenInNew />}
            >
              Launch Clinics Portal
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

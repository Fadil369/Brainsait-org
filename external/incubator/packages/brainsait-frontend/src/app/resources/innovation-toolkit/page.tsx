import type { Metadata } from 'next';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  AutoAwesome,
  Download,
  Hub,
  MenuBook,
  School,
} from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'Innovation Toolkit — Saudi Healthcare Edition | BrainSAIT Resources',
  description:
    'UN Innovation Toolkit adapted for Saudi healthcare startups: 21 tools, 10 training modules, S.P.A.C.E. framework, Vision 2030 alignment. Bilingual Arabic–English.',
};

const spaceFramework = [
  {
    letter: 'S',
    en: 'Strategy',
    ar: 'الاستراتيجية',
    description: 'Define your innovation direction, patient impact goals, and Vision 2030 alignment.',
    tools: 5,
    color: '#0ea5e9',
  },
  {
    letter: 'P',
    en: 'Partnerships',
    ar: 'الشراكات',
    description: 'Map ecosystem collaborators, payers, regulators, and integration partners.',
    tools: 4,
    color: '#6366f1',
  },
  {
    letter: 'A',
    en: 'Architecture',
    ar: 'البنية التحتية',
    description: 'Design interoperable systems: NPHIES, FHIR R4, cloud infrastructure, and data flows.',
    tools: 4,
    color: '#10b981',
  },
  {
    letter: 'C',
    en: 'Culture',
    ar: 'الثقافة',
    description: 'Build innovation-ready teams, patient-centred workflows, and continuous learning habits.',
    tools: 4,
    color: '#f59e0b',
  },
  {
    letter: 'E',
    en: 'Evaluation',
    ar: 'التقييم',
    description: 'Measure impact, iterate on clinical and financial outcomes, and scale what works.',
    tools: 4,
    color: '#ef4444',
  },
];

const toolSummary = [
  { category: 'Strategy', count: 5, examples: 'Innovation Canvas, Opportunity Map, SWOT+, Horizon Scan, Vision Alignment' },
  { category: 'Partnerships', count: 4, examples: 'Ecosystem Map, Partner Fit Matrix, MOU Template, Data-Sharing Contract' },
  { category: 'Infrastructure', count: 4, examples: 'Tech Stack Blueprint, FHIR Integration Checklist, Cloud Migration Roadmap, Compliance Audit' },
  { category: 'Culture', count: 4, examples: 'Innovation Culture Survey, Sprint Playbook, Patient Empathy Map, Team Retrospective' },
  { category: 'Evaluation', count: 4, examples: 'KPI Dashboard, Impact Assessment, Pilot Evaluation Framework, Scale Readiness Scorecard' },
];

export default function InnovationToolkitPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="/">BrainSAIT</Link>
          <Link underline="hover" color="inherit" href="/incubator">Incubator</Link>
          <Link underline="hover" color="inherit" href="/incubator/resources">Resources</Link>
          <Typography color="text.primary">Innovation Toolkit</Typography>
        </Breadcrumbs>

        {/* Hero */}
        <Card
          sx={{
            borderRadius: 5,
            overflow: 'hidden',
            mb: 5,
            background: 'linear-gradient(135deg, #08131f 0%, #102745 55%, #16547e 100%)',
            color: 'white',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 6 } }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              <Chip icon={<MenuBook />} label="Resource" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }} />
              <Chip icon={<Hub />} label="S.P.A.C.E. Framework" sx={{ bgcolor: 'rgba(14,165,233,0.25)', color: '#bae6fd' }} />
              <Chip icon={<AutoAwesome />} label="Bilingual AR / EN" sx={{ bgcolor: 'rgba(99,102,241,0.25)', color: '#c7d2fe' }} />
            </Stack>
            <Typography variant="h3" fontWeight={800} sx={{ color: 'white', maxWidth: 860, mb: 2 }}>
              Innovation Toolkit — Saudi Healthcare Edition
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: 'rgba(255,255,255,0.76)', maxWidth: 780, fontWeight: 400, mb: 1.5 }}
            >
              مجموعة أدوات الابتكار · نسخة BrainSAIT للرعاية الصحية السعودية
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(255,255,255,0.65)', maxWidth: 780, mb: 4 }}
            >
              The UN Innovation Toolkit reimagined for Saudi healthcare startups: 21 practical tools,
              10 learning modules, 27 diagnostic questions, and a clear path to Vision 2030 compliance.
              Fully bilingual Arabic–English with NPHIES, FHIR R4, and HIPAA alignment built in.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                href="/brainsait_innovation_toolkit.html"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<ArrowForward />}
                sx={{ bgcolor: '#0ea5e9', '&:hover': { bgcolor: '#0284c7' } }}
              >
                Open Interactive Toolkit
              </Button>
              <Button
                variant="outlined"
                href="/brainsait_innovation_toolkit_ar.md"
                download
                endIcon={<Download />}
                sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
              >
                Download Arabic Guide
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* What&apos;s inside */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {[
            { label: '21', sub: 'Practical tools', icon: <AutoAwesome sx={{ color: '#0ea5e9' }} /> },
            { label: '10', sub: 'Learning modules', icon: <School sx={{ color: '#6366f1' }} /> },
            { label: '27', sub: 'Diagnostic questions', icon: <MenuBook sx={{ color: '#10b981' }} /> },
            { label: '5', sub: 'S.P.A.C.E. pillars', icon: <Hub sx={{ color: '#f59e0b' }} /> },
          ].map((stat) => (
            <Grid item xs={6} md={3} key={stat.sub}>
              <Card sx={{ borderRadius: 4, textAlign: 'center' }}>
                <CardContent sx={{ py: 3 }}>
                  {stat.icon}
                  <Typography variant="h3" fontWeight={800} sx={{ mt: 1 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.sub}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* S.P.A.C.E. Framework */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          The S.P.A.C.E. Framework
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          إطار S.P.A.C.E. للمؤسسات الصحية — Five pillars for systematic healthcare innovation.
        </Typography>
        <Grid container spacing={2.5} sx={{ mb: 6 }}>
          {spaceFramework.map((pillar) => (
            <Grid item xs={12} md={4} lg={2.4} key={pillar.letter}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  borderTop: `4px solid ${pillar.color}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h3"
                    fontWeight={900}
                    sx={{ color: pillar.color, lineHeight: 1, mb: 0.5 }}
                  >
                    {pillar.letter}
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {pillar.en}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {pillar.ar}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {pillar.description}
                  </Typography>
                  <Chip label={`${pillar.tools} tools`} size="small" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tool catalogue */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Tool Catalogue — all 21 tools
        </Typography>
        <Card sx={{ borderRadius: 4, mb: 6, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Tools</strong></TableCell>
                <TableCell><strong>Examples</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {toolSummary.map((row) => (
                <TableRow key={row.category} hover>
                  <TableCell>
                    <Chip label={row.category} size="small" />
                  </TableCell>
                  <TableCell>{row.count}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {row.examples}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Saudi context */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Saudi Healthcare Context
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            {
              title: 'Vision 2030 Alignment',
              body: 'Every tool maps to healthcare sector goals under Vision 2030: nationalisation, digital transformation, and quality-of-care uplift.',
            },
            {
              title: 'NPHIES & FHIR R4',
              body: 'Infrastructure tools include NPHIES integration checklists and FHIR R4 data-model guidance for compliant system design.',
            },
            {
              title: 'HIPAA + PDPL',
              body: 'Compliance templates address both international HIPAA standards and Saudi PDPL patient-data governance requirements.',
            },
            {
              title: 'Bilingual Arabic–English',
              body: 'All tools, prompts, and diagnostic questions are available in Arabic and English. RTL and LTR layouts supported throughout.',
            },
          ].map((card) => (
            <Grid item xs={12} md={6} key={card.title}>
              <Card sx={{ height: '100%', borderRadius: 4 }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.body}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA */}
        <Card sx={{ borderRadius: 4, bgcolor: 'action.hover' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Ready to start your innovation journey?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Open the interactive toolkit or apply to the BrainSAIT Incubator to get guided support.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                href="/brainsait_innovation_toolkit.html"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<ArrowForward />}
                size="large"
              >
                Open Toolkit
              </Button>
              <Button
                variant="outlined"
                href="/incubator/apply"
                endIcon={<ArrowForward />}
                size="large"
              >
                Apply to Incubator
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

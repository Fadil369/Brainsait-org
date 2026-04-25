import React from 'react';
import { ArrowForward } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { incubatorPath } from '@/lib/incubator-paths';

interface RouteAction {
  label: string;
  href: string;
  external?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
}

interface RouteHighlight {
  title: string;
  description: string;
}

interface LaunchRoutePageProps {
  badge: string;
  title: string;
  description: string;
  highlights: RouteHighlight[];
  actions: RouteAction[];
}

export default function LaunchRoutePage({
  badge,
  title,
  description,
  highlights,
  actions,
}: LaunchRoutePageProps) {
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)' }}>
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 7, md: 10 } }}>
          <Card
            sx={{
              borderRadius: 6,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #08131f 0%, #0f2746 58%, #183b67 100%)',
              color: 'white',
              mb: 4,
            }}
          >
            <CardContent sx={{ p: { xs: 3.5, md: 5 } }}>
              <Chip label={badge} sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white', mb: 2 }} />
              <Typography variant="h2" fontWeight={800} sx={{ maxWidth: 860, mb: 2 }}>
                {title}
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.76)', fontWeight: 400, maxWidth: 820, mb: 4 }}>
                {description}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap flexWrap="wrap">
                {actions.map((action, index) => (
                  <Button
                    key={`${action.label}-${action.href}`}
                    variant={action.variant ?? (index === 0 ? 'contained' : 'outlined')}
                    size="large"
                    href={action.external ? action.href : incubatorPath(action.href)}
                    target={action.external ? '_blank' : undefined}
                    rel={action.external ? 'noopener noreferrer' : undefined}
                    endIcon={index === 0 ? <ArrowForward /> : undefined}
                    sx={
                      index === 0
                        ? {
                            bgcolor: 'white',
                            color: '#08131f',
                            '&:hover': { bgcolor: 'grey.100' },
                          }
                        : {
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.24)',
                          }
                    }
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {highlights.map((highlight) => (
              <Grid item xs={12} md={4} key={highlight.title}>
                <Card sx={{ height: '100%', borderRadius: 4 }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {highlight.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {highlight.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

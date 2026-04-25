'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Chat as ChatIcon,
  Telegram as TelegramIcon,
  VideoCall as VideoCallIcon,
  ArrowForward,
  NoteAdd as NoteIcon,
} from '@mui/icons-material';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { incubatorPath } from '@/lib/incubator-paths';

// --------------------------------------------------------------------------
// Live Q&A / pre-session chat panel
// --------------------------------------------------------------------------
function PreSessionChat({ roomId }: { roomId: string }) {
  const { messages, connected, loading, sendMessage } = useRealtimeRoom(roomId);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    await sendMessage(trimmed, 'Founder');
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', height: 340, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <ChatIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography variant="subtitle2" fontWeight={700}>Pre-session Notes</Typography>
        <Chip
          size="small"
          label={connected ? 'Live' : 'Connecting…'}
          color={connected ? 'success' : 'default'}
          sx={{ ml: 'auto' }}
        />
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {loading ? (
          <Typography variant="body2" color="text.disabled">Loading…</Typography>
        ) : messages.length === 0 ? (
          <Typography variant="body2" color="text.disabled">
            Share any questions or context before your session.
          </Typography>
        ) : (
          messages.slice(-20).map((msg) => (
            <Box key={msg.id} sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary">{msg.senderName}</Typography>
              <Typography variant="body2">{msg.message}</Typography>
            </Box>
          ))
        )}
      </Box>

      <Divider />
      <Stack direction="row" spacing={1} sx={{ p: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Add a note for your mentor…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
        />
        <IconButton size="small" color="primary" onClick={() => void handleSend()} disabled={!input.trim()}>
          <NoteIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}

// --------------------------------------------------------------------------
// Main OneToOneClient component
// --------------------------------------------------------------------------
export default function OneToOneClient() {
  const [tab, setTab] = useState(0);

  const highlights = [
    {
      title: 'Founder Problem-Solving',
      description: 'Unblock clinical workflows, business model questions, or technical decision points in a focused session.',
    },
    {
      title: 'Specialist Access',
      description: 'Route into the right BrainSAIT mentors for regulatory, engineering, data, and scaling challenges.',
    },
    {
      title: 'Program Acceleration',
      description: 'Connect each session back to program milestones so advisory time turns into visible progress.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)' }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 5, md: 8 } }}>

        {/* Hero */}
        <Card
          sx={{
            borderRadius: 6,
            background: 'linear-gradient(135deg, #08131f 0%, #0f2746 58%, #183b67 100%)',
            color: 'white',
            mb: 4,
          }}
        >
          <CardContent sx={{ p: { xs: 3.5, md: 5 } }}>
            <Chip label="1:1 Route" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white', mb: 2 }} />
            <Typography variant="h3" fontWeight={800} sx={{ maxWidth: 720, mb: 2 }}>
              Book focused founder support without leaving the incubator.
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.76)', fontWeight: 400, maxWidth: 680, mb: 4 }}>
              Move from general guidance to a specific session on product, compliance, GTM, clinical operations, or venture readiness.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap flexWrap="wrap">
              <Button
                variant="contained"
                size="large"
                href="https://calendly.com/fadil369"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<CalendarIcon />}
                endIcon={<ArrowForward />}
                sx={{ bgcolor: 'white', color: '#08131f', '&:hover': { bgcolor: 'grey.100' } }}
              >
                Book a 1:1 session
              </Button>
              <Button
                variant="outlined"
                size="large"
                href={incubatorPath('/mentorship')}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.24)' }}
              >
                Open mentorship hub
              </Button>
              <Tooltip title="Join our Telegram community">
                <Button
                  variant="outlined"
                  size="large"
                  href="https://t.me/BrainSAITBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<TelegramIcon />}
                  sx={{ color: '#229ED9', borderColor: 'rgba(34,158,217,0.4)' }}
                >
                  Telegram
                </Button>
              </Tooltip>
            </Stack>
          </CardContent>
        </Card>

        {/* Tabs: Highlights | Live Chat | Video */}
        <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 4, overflow: 'hidden' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Tab label="Overview" />
            <Tab label="Pre-session Chat" />
            <Tab label="Video Call" />
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {tab === 0 && (
              <Grid container spacing={3}>
                {highlights.map((h) => (
                  <Grid item xs={12} md={4} key={h.title}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} gutterBottom>{h.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{h.description}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}

            {tab === 1 && (
              <Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Leave notes or questions for your mentor before the session. Messages are synced in real-time across the team room.
                </Typography>
                <PreSessionChat roomId="mentorship" />
              </Box>
            )}

            {tab === 2 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <VideoCallIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Start a Video Session
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3} sx={{ maxWidth: 480, mx: 'auto' }}>
                  Launch a Cloudflare-powered WebRTC video call directly in your browser — no plugins required.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  href="https://calls.brainsait.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<VideoCallIcon />}
                  endIcon={<ArrowForward />}
                >
                  Start Video Call
                </Button>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Session types */}
        <Typography variant="h6" fontWeight={700} mb={2}>Session Focus Areas</Typography>
        <Grid container spacing={2}>
          {[
            { label: 'Product Strategy', desc: 'Feature prioritisation, roadmap, and market fit.' },
            { label: 'Clinical Operations', desc: 'Workflow design, compliance, and patient safety protocols.' },
            { label: 'GTM & Growth', desc: 'Market entry, sales motion, and partnership frameworks.' },
            { label: 'Regulatory & Legal', desc: 'MOH approvals, NPHIES integration, and licensing.' },
            { label: 'Technical Architecture', desc: 'Infrastructure, security, and engineering decisions.' },
            { label: 'Venture Readiness', desc: 'Investment decks, financial modelling, and due diligence prep.' },
          ].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.label}>
              <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>{item.label}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

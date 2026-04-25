'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Circle as CircleIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Telegram as TelegramIcon,
  Google as GoogleIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material';
import { useRealtimeRoom, type ChatMessage } from '@/hooks/useRealtimeRoom';

// Dynamically import VideoCallPanel — no SSR (uses MediaDevices / RTCPeerConnection)
const VideoCallPanel = dynamic(
  () => import('@/components/realtime/VideoCallPanel'),
  { ssr: false },
);

// --------------------------------------------------------------------------
// Room configuration
// --------------------------------------------------------------------------
const ROOMS = [
  { id: 'general',    label: 'General',        color: '#0052cc' },
  { id: 'dev',        label: 'Development',    color: '#00875a' },
  { id: 'operations', label: 'Operations',      color: '#974f0c' },
  { id: 'mentorship', label: 'Mentor Sessions', color: '#5243aa' },
] as const;

type RoomId = (typeof ROOMS)[number]['id'];

// --------------------------------------------------------------------------
// Avatar helpers
// --------------------------------------------------------------------------
function senderInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

function senderColor(id: string): string {
  const hue = Math.abs(id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 360;
  return `hsl(${hue}, 55%, 40%)`;
}

// --------------------------------------------------------------------------
// Message bubble
// --------------------------------------------------------------------------
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isOwn = msg.direction === 'outgoing';
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Stack
      direction={isOwn ? 'row-reverse' : 'row'}
      spacing={1}
      alignItems="flex-end"
      sx={{ mb: 1.5, px: 1 }}
    >
      {!isOwn && (
        <Avatar
          sx={{ width: 32, height: 32, fontSize: 13, bgcolor: senderColor(msg.senderId) }}
        >
          {senderInitials(msg.senderName)}
        </Avatar>
      )}
      <Box sx={{ maxWidth: '70%' }}>
        {!isOwn && (
          <Typography variant="caption" color="text.secondary" sx={{ pl: 1, mb: 0.5, display: 'block' }}>
            {msg.senderName}
          </Typography>
        )}
        <Box
          sx={{
            bgcolor: isOwn ? '#0f2746' : 'grey.100',
            color: isOwn ? 'white' : 'text.primary',
            borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            px: 2,
            py: 1.25,
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {msg.message}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.disabled" sx={{ px: 1, display: 'block', textAlign: isOwn ? 'right' : 'left' }}>
          {time}
        </Typography>
      </Box>
    </Stack>
  );
}

// --------------------------------------------------------------------------
// Chat panel for a single room
// --------------------------------------------------------------------------
function ChatPanel({ roomId, roomColor }: { roomId: RoomId; roomColor: string }) {
  const { messages, connected, loading, sendMessage, error } = useRealtimeRoom(roomId);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    await sendMessage(trimmed, 'You');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Status bar */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <CircleIcon sx={{ fontSize: 10, color: connected ? '#00875a' : 'error.main' }} />
        <Typography variant="caption" color="text.secondary">
          {connected ? 'Live' : 'Reconnecting…'}
        </Typography>
        {error && (
          <Chip label={error} size="small" color="warning" variant="outlined" />
        )}
      </Stack>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', pt: 6 }}>
            <Typography variant="body2" color="text.disabled">
              No messages yet. Say hello!
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Divider />
      <Box sx={{ p: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Write a message… (Enter to send)"
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => void handleSend()}
                  disabled={!input.trim()}
                  sx={{ color: roomColor }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}

// --------------------------------------------------------------------------
// Main TeamRoomClient component
// --------------------------------------------------------------------------
export default function TeamRoomClient() {
  const [activeRoom, setActiveRoom] = useState<RoomId>('general');
  const [videoOpen, setVideoOpen] = useState(false);
  const [sharedSessionId, setSharedSessionId] = useState<string | undefined>(undefined);

  const room = ROOMS.find((r) => r.id === activeRoom) ?? ROOMS[0];

  const telegramUrl = 'https://t.me/BrainSAITBot';
  const calendarUrl = 'https://calendly.com/fadil369';

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)', py: { xs: 3, md: 5 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 } }}>

        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} spacing={2}>
          <Box>
            <Chip label="Team Room" size="small" sx={{ bgcolor: '#0f2746', color: 'white', mb: 1 }} />
            <Typography variant="h4" fontWeight={800}>
              Startup Workspace
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time coordination across your incubator team
            </Typography>
          </Box>

          {/* Action buttons */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="Join on Telegram">
              <IconButton
                component="a"
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ bgcolor: '#229ED9', color: 'white', '&:hover': { bgcolor: '#1a8fc7' } }}
              >
                <TelegramIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in Google Chat">
              <IconButton
                component="a"
                href="https://chat.google.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ bgcolor: '#34A853', color: 'white', '&:hover': { bgcolor: '#2d9249' } }}
              >
                <GoogleIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Start Video Call">
              <IconButton
                onClick={() => setVideoOpen(true)}
                sx={{ bgcolor: room.color, color: 'white', '&:hover': { filter: 'brightness(0.9)' } }}
              >
                <VideoCallIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Room tabs + chat panel */}
        <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Tabs
              value={activeRoom}
              onChange={(_, val) => setActiveRoom(val as RoomId)}
              variant="scrollable"
              scrollButtons="auto"
              TabIndicatorProps={{ style: { backgroundColor: room.color } }}
            >
              {ROOMS.map((r) => (
                <Tab
                  key={r.id}
                  value={r.id}
                  label={r.label}
                  sx={{ fontWeight: 600, '&.Mui-selected': { color: r.color } }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Chat panel — fixed height for scrollable message area */}
          <Box sx={{ height: { xs: 450, md: 560 }, display: 'flex', flexDirection: 'column' }}>
            <ChatPanel roomId={activeRoom} roomColor={room.color} />
          </Box>
        </Paper>

        {/* Footer links */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={3} justifyContent="center">
          {[
            { label: 'Book a 1:1 session', href: calendarUrl, external: true },
            { label: 'Mentorship hub', href: '/incubator/mentorship' },
            { label: 'Projects', href: '/incubator/projects' },
            { label: 'Portal', href: '/incubator/portal' },
          ].map((link) => (
            <Typography
              key={link.label}
              component="a"
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              variant="body2"
              sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {link.label}
            </Typography>
          ))}
        </Stack>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Video Call Dialog                                                    */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: '#0f172a',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'white',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            py: 1.5,
            px: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <VideoCallIcon sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700}>
              Video Call — {room.label}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setVideoOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <VideoCallPanel
            compact
            remoteSessionId={sharedSessionId}
            onSessionCreated={(id) => setSharedSessionId(id)}
          />
          {sharedSessionId && (
            <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>
                Share session ID with teammates to let them join:{' '}
                <Box component="span" sx={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.75)' }}>
                  {sharedSessionId}
                </Box>
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

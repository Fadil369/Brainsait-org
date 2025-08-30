import {
    Message as MessageIcon,
    MoreVert as MoreVertIcon,
    People as PeopleIcon,
    Schedule as ScheduleIcon,
    School as SchoolIcon,
    Star as StarIcon,
    VideoCall as VideoCallIcon
} from '@mui/icons-material';
import {
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ChampionDashboardData {
  champion: {
    id: string;
    level: string;
    specializations: string[];
    bio: string;
    metrics: {
      averageRating: number;
      menteesHelped: number;
      sessionsCompleted: number;
      totalHoursContributed: number;
    };
  };
  activeMentorships: Array<{
    id: string;
    mentee: {
      user: {
        firstName: string;
        lastName: string;
        profilePicture?: string;
      };
    };
    startDate: string;
    goals: string[];
    progress: number;
    nextSession?: {
      scheduledAt: string;
    };
  }>;
  pendingApplications: Array<{
    id: string;
    mentee: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
    appliedAt: string;
    currentLevel: string;
    goals: string[];
  }>;
  recentSessions: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    mentorship: {
      mentee: {
        user: {
          firstName: string;
          lastName: string;
        };
      };
    };
  }>;
  stats: {
    totalMentorships: number;
    activeMentorships: number;
    pendingApplications: number;
    averageRating: number;
    totalHours: number;
  };
}

const AIChampionDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChampionDashboardData | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMentorship, setSelectedMentorship] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/ai-champions/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, status: 'ACCEPTED' | 'REJECTED', message?: string) => {
    try {
      const response = await fetch(`/api/ai-champions/mentorship/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, message })
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, mentorshipId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedMentorship(mentorshipId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMentorship(null);
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!data) {
    return (
      <Typography variant="h6" color="error">
        {t('dashboardLoadError')}
      </Typography>
    );
  }

  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {data.stats.activeMentorships}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('activeMentorships')}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {data.stats.totalMentorships}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('totalMenteesHelped')}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {data.stats.averageRating.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('averageRating')}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <ScheduleIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {data.stats.totalHours}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('hoursContributed')}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Pending Applications */}
      {data.stats.pendingApplications > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Badge badgeContent={data.stats.pendingApplications} color="primary">
                  {t('pendingApplications')}
                </Badge>
              </Typography>
              <List>
                {data.pendingApplications.slice(0, 3).map((application) => (
                  <ListItem
                    key={application.id}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleApplicationAction(application.id, 'ACCEPTED')}
                        >
                          {t('accept')}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleApplicationAction(application.id, 'REJECTED')}
                        >
                          {t('decline')}
                        </Button>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {application.mentee.user.firstName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${application.mentee.user.firstName} ${application.mentee.user.lastName}`}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {t('level')}: {application.currentLevel}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('appliedAt')}: {new Date(application.appliedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  const renderActiveMentorships = () => (
    <Grid container spacing={3}>
      {data.activeMentorships.map((mentorship) => (
        <Grid item xs={12} md={6} key={mentorship.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={mentorship.mentee.user.profilePicture}>
                    {mentorship.mentee.user.firstName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {mentorship.mentee.user.firstName} {mentorship.mentee.user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('started')}: {new Date(mentorship.startDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={(e) => handleMenuClick(e, mentorship.id)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                {t('progress')}: {mentorship.progress}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={mentorship.progress} 
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" gutterBottom>
                {t('goals')}:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {mentorship.goals.slice(0, 3).map((goal, index) => (
                  <Chip key={index} label={goal} size="small" />
                ))}
                {mentorship.goals.length > 3 && (
                  <Chip label={`+${mentorship.goals.length - 3} more`} size="small" variant="outlined" />
                )}
              </Box>

              {mentorship.nextSession && (
                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="body2">
                    {t('nextSession')}: {new Date(mentorship.nextSession.scheduledAt).toLocaleString()}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderRecentSessions = () => (
    <List>
      {data.recentSessions.map((session) => (
        <React.Fragment key={session.id}>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                {session.mentorship.mentee.user.firstName[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${session.mentorship.mentee.user.firstName} ${session.mentorship.mentee.user.lastName}`}
              secondary={
                <Box>
                  <Typography variant="body2">
                    {new Date(session.scheduledAt).toLocaleString()}
                  </Typography>
                  <Chip 
                    label={session.status} 
                    size="small" 
                    color={session.status === 'COMPLETED' ? 'success' : 'default'}
                  />
                </Box>
              }
            />
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('aiChampionDashboard')}
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(event, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('overview')} />
          <Tab label={t('activeMentorships')} />
          <Tab label={t('recentSessions')} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 0 && renderOverview()}
          {currentTab === 1 && renderActiveMentorships()}
          {currentTab === 2 && renderRecentSessions()}
        </Box>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <VideoCallIcon sx={{ mr: 1 }} />
          {t('startSession')}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <MessageIcon sx={{ mr: 1 }} />
          {t('sendMessage')}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ScheduleIcon sx={{ mr: 1 }} />
          {t('scheduleSession')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AIChampionDashboard;
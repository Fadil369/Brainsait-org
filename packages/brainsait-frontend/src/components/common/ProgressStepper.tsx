'use client';

import React from 'react';
import {
  Box,
  Step,
  StepLabel,
  StepContent,
  Stepper,
  Typography,
  Button,
  Paper,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Schedule as ScheduleIcon,
  Block as BlockIcon,
  PlayCircle as PlayCircleIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAppTheme } from '../../lib/ThemeProvider';
import { StepperStep } from '../../types/component.types';

export interface ProgressStepperProps {
  steps: StepperStep[];
  activeStep: number;
  orientation?: 'horizontal' | 'vertical';
  showDescription?: boolean;
  showProgress?: boolean;
  onStepClick?: (stepIndex: number) => void;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  variant?: 'default' | 'compact' | 'detailed';
  completionMessage?: string;
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  activeStep,
  orientation = 'horizontal',
  showDescription = true,
  showProgress = true,
  onStepClick,
  onNext,
  onBack,
  nextLabel,
  backLabel,
  variant = 'default',
  completionMessage,
}) => {
  const { t } = useTranslation(['common', 'incubation']);
  const { language, direction } = useAppTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'active':
        return <PlayCircleIcon color="primary" />;
      case 'disabled':
        return <BlockIcon color="disabled" />;
      default:
        return <RadioButtonUncheckedIcon color="action" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
        return 'primary';
      case 'disabled':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getProgressPercentage = () => {
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  const renderStepLabel = (step: StepperStep, index: number) => {
    const isActive = index === activeStep;
    const label = step.label[language] || step.label.en;
    const description = step.description?.[language] || step.description?.en;

    return (
      <Box
        sx={{
          cursor: onStepClick ? 'pointer' : 'default',
          '&:hover': onStepClick ? {
            opacity: 0.8,
          } : {},
        }}
        onClick={() => onStepClick?.(index)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            variant={isActive ? 'subtitle1' : 'body2'}
            sx={{
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'primary.main' : 'text.primary',
            }}
          >
            {label}
          </Typography>
          
          <Chip
            size="small"
            label={t(`common.status.${step.status}`, { defaultValue: step.status })}
            color={getStepColor(step.status) as any}
            variant={step.status === 'active' ? 'filled' : 'outlined'}
            sx={{ 
              minWidth: 80, 
              fontSize: '0.7rem',
              height: 20,
            }}
          />
          
          {step.optional && (
            <Chip
              size="small"
              label={t('common.optional')}
              variant="outlined"
              sx={{ 
                fontSize: '0.65rem',
                height: 18,
                color: 'text.secondary',
                borderColor: 'divider',
              }}
            />
          )}
        </Box>
        
        {showDescription && description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              lineHeight: 1.3,
              maxWidth: '90%',
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
    );
  };

  const renderCompactStepper = () => (
    <Box>
      {showProgress && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('common.progress')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(getProgressPercentage())}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getProgressPercentage()}
            sx={{
              height: 8,
              borderRadius: 4,
            }}
          />
        </Box>
      )}
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {steps.map((step, index) => (
          <Chip
            key={step.id}
            icon={getStepIcon(step.status)}
            label={step.label[language] || step.label.en}
            color={getStepColor(step.status) as any}
            variant={index === activeStep ? 'filled' : 'outlined'}
            onClick={() => onStepClick?.(index)}
            sx={{
              cursor: onStepClick ? 'pointer' : 'default',
              '&:hover': onStepClick ? {
                backgroundColor: theme.palette.primary.light,
              } : {},
            }}
          />
        ))}
      </Box>
    </Box>
  );

  const renderDefaultStepper = () => (
    <Stepper
      activeStep={activeStep}
      orientation={isMobile ? 'vertical' : orientation}
      sx={{
        '& .MuiStepLabel-root': {
          cursor: onStepClick ? 'pointer' : 'default',
        },
      }}
    >
      {steps.map((step, index) => (
        <Step key={step.id} completed={step.status === 'completed'}>
          <StepLabel
            StepIconComponent={() => getStepIcon(step.status)}
            onClick={() => onStepClick?.(index)}
          >
            {renderStepLabel(step, index)}
          </StepLabel>
          
          {orientation === 'vertical' && step.description && (
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                {step.description[language] || step.description.en}
              </Typography>
            </StepContent>
          )}
        </Step>
      ))}
    </Stepper>
  );

  const renderDetailedStepper = () => (
    <Box>
      {showProgress && (
        <Paper
          elevation={1}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.light}20, ${theme.palette.secondary.light}20)`,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t('incubation.progress.overview')}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              {steps.filter(s => s.status === 'completed').length} of {steps.length} completed
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {Math.round(getProgressPercentage())}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getProgressPercentage()}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Paper>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {steps.map((step, index) => (
          <Paper
            key={step.id}
            elevation={index === activeStep ? 3 : 1}
            sx={{
              p: 3,
              borderRadius: 2,
              border: index === activeStep ? `2px solid ${theme.palette.primary.main}` : '1px solid',
              borderColor: index === activeStep ? 'primary.main' : 'divider',
              cursor: onStepClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease-in-out',
              '&:hover': onStepClick ? {
                elevation: 3,
                borderColor: 'primary.light',
              } : {},
            }}
            onClick={() => onStepClick?.(index)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              {getStepIcon(step.status)}
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {step.label[language] || step.label.en}
              </Typography>
              <Chip
                label={t(`common.status.${step.status}`)}
                color={getStepColor(step.status) as any}
                variant={step.status === 'active' ? 'filled' : 'outlined'}
              />
            </Box>
            
            {step.description && (
              <Typography variant="body2" color="text.secondary">
                {step.description[language] || step.description.en}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );

  const renderNavigationButtons = () => {
    if (!onNext && !onBack) return null;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          onClick={onBack}
          disabled={activeStep === 0}
          variant="outlined"
        >
          {backLabel || t('common.back')}
        </Button>
        
        <Button
          onClick={onNext}
          disabled={activeStep >= steps.length - 1}
          variant="contained"
        >
          {nextLabel || t('common.next')}
        </Button>
      </Box>
    );
  };

  const isCompleted = activeStep >= steps.length;

  if (isCompleted && completionMessage) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          background: `linear-gradient(45deg, ${theme.palette.success.light}20, ${theme.palette.primary.light}20)`,
        }}
      >
        <CheckCircleIcon
          sx={{
            fontSize: 64,
            color: 'success.main',
            mb: 2,
          }}
        />
        <Typography variant="h5" gutterBottom>
          {completionMessage}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('incubation.progress.completed')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {variant === 'compact' && renderCompactStepper()}
      {variant === 'default' && renderDefaultStepper()}
      {variant === 'detailed' && renderDetailedStepper()}
      
      {renderNavigationButtons()}
    </Box>
  );
};

export default ProgressStepper;
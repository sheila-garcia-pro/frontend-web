import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  icon?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, subtitle, color, icon }) => {
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 140,
        backgroundColor: `${color}.main`,
        color: `${color}.contrastText`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>
        {icon && <Box sx={{ fontSize: '2rem' }}>{icon}</Box>}
      </Box>
      <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
        {value}
      </Typography>
      <Typography variant="body2">{subtitle}</Typography>
    </Paper>
  );
};

export default DashboardCard; 
import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

export interface SocialLinkItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SocialLinksProps {
  title?: string;
  links: SocialLinkItem[];
}

const SocialLinks: React.FC<SocialLinksProps> = ({ title = 'Siga a Sheila Garcia', links }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {links.map((link) => (
          <Tooltip key={link.label} title={link.label} placement="top" arrow>
            <IconButton
              component="a"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              size="small"
              sx={{
                borderRadius: 2,
                p: 0.75,
                minWidth: 32,
                minHeight: 32,
                color: theme.palette.text.secondary,
                border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                backgroundColor: alpha(theme.palette.text.primary, 0.02),
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: theme.palette.primary.main,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {link.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

export default SocialLinks;

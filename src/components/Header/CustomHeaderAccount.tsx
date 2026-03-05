'use client';

import React from 'react';
import { Container, Button, Stack, IconButton } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { AccountDropdown } from '@pagopa/mui-italia/dist/components/AccountDropdown';
import { ButtonNaked } from '@pagopa/mui-italia';
import { AccountDropdown } from '@pagopa/mui-italia';

/* Icons */
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export type JwtUser = {
  id: string;
  name?: string;
  surname?: string;
  email?: string;
};

export type UserAction = {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

export type RootLinkType = {
  label: string;
  href: string;
  ariaLabel: string;
  title: string;
};

const defaultTranslationsMap = {
  logIn: 'Accedi',
  logOut: 'Esci',
  assistance: 'Assistenza',
  documentation: 'Manuale operativo',
};

type HeaderAccountProps = {
  rootLink: RootLinkType;
  loggedUser?: JwtUser | false;
  onAssistanceClick: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
  userActions?: Array<UserAction>;
  enableDropdown?: boolean;
  enableLogin?: boolean;
  enableAssistanceButton?: boolean;
  onDocumentationClick?: () => void;
  translationsMap?: {
    logIn?: string;
    logOut?: string;
    assistance?: string;
    documentation?: string;
  };
};

export const CustomHeaderAccount = ({
  rootLink,
  loggedUser,
  userActions,
  onAssistanceClick,
  onDocumentationClick,
  onLogout,
  onLogin,
  enableDropdown = false,
  enableLogin = true,
  enableAssistanceButton = true,
  translationsMap = defaultTranslationsMap,
}: HeaderAccountProps) => (
  <Stack
    component="div"
    justifyContent="center"
    sx={{
      borderBottom: 1,
      borderColor: 'divider',
      backgroundColor: 'background.paper',
      minHeight: '48px',
      color: blueGrey[900],
    }}
  >
    <Container maxWidth={false}>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center">
        {rootLink && (
          <Button
            component="a"
            size="small"
            aria-label={rootLink?.ariaLabel}
            href={rootLink?.href}
            target="_blank"
            rel="noreferrer"
            sx={{
              fontWeight: 'bold',
              color: blueGrey[900],
              '&:hover': {
                color: blueGrey[700] + "!important",
              },
            }}
          >
            {rootLink?.label}
          </Button>
        )}

        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 3, md: 4 }}>
          {/* START Documentation MOBILE/DESKTOP */}
          {onDocumentationClick && (
            <>
              <Button
                size="small"
                variant="text"
                onClick={onDocumentationClick}
                startIcon={<MenuBookIcon />}
                sx={{
                  display: ['none', 'flex'],
                  color: blueGrey[900],
                  '&:hover': {
                    color: blueGrey[700] + "!important",
                  },
                }}
              >
                {translationsMap.documentation || defaultTranslationsMap.documentation}
              </Button>
              <IconButton
                size="small"
                aria-label="Documentazione"
                sx={{ display: ['flex', 'none'], color: 'text.primary' }}
                onClick={onDocumentationClick}
              >
                <MenuBookIcon fontSize="inherit" />
              </IconButton>
            </>
          )}
          {/* END Documentation MOBILE/DESKTOP */}

          {/* START Assistance MOBILE/DESKTOP */}
          {enableAssistanceButton && (
            <>
              <Button
                size="small"
                variant="text"
                onClick={onAssistanceClick}
                startIcon={<HelpOutlineRoundedIcon />}
                sx={{
                  display: ['none', 'flex'],
                  color: blueGrey[900],
                  '&:hover': {
                    color: blueGrey[700] + "!important",
                  },
                }}
              >
                {translationsMap.assistance || defaultTranslationsMap.assistance}
              </Button>
              <IconButton
                size="small"
                aria-label="Assistenza"
                sx={{ display: ['flex', 'none'], color: 'text.primary' }}
                onClick={onAssistanceClick}
              >
                <HelpOutlineRoundedIcon fontSize="inherit" />
              </IconButton>
            </>
          )}
          {/* END Assistance MOBILE/DESKTOP */}

          {/* DIFFERENT COMBINATIONS */}

          {/* 1. Logged User with Dropdown */}
          {enableLogin && loggedUser && enableDropdown && (
            <AccountDropdown user={loggedUser} userActions={userActions} />
          )}

          {/* 2. Logged User with Logout CTA */}
          {enableLogin && loggedUser && !enableDropdown && (
            <Button variant="text" size="small" onClick={onLogout} title="Esci">
              {translationsMap.logOut || defaultTranslationsMap.logOut}
            </Button>
          )}

          {/* 3. User not logged with Login CTA */}
          {enableLogin && !loggedUser && (
            <Button variant="contained" size="small" onClick={onLogin} title="Accedi">
              {translationsMap.logIn || defaultTranslationsMap.logIn}
            </Button>
          )}
        </Stack>
      </Stack>
    </Container>
  </Stack>
);

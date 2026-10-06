import { Box, Card, CardContent } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { ReactNode } from 'react';

interface InitiativeOverviewCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  titleVariant?: 'h4' | 'h5' | 'h6';
  subtitleVariant?: 'body1' | 'body2' | 'caption';
}

const InitiativeOverviewCard = ({
  children,
  title,
  subtitle,
  titleVariant,
  subtitleVariant = 'caption',
}: InitiativeOverviewCardProps) => (
  <Card
    sx={{
      borderRadius: 0,
      width: '100%',
    }}
    data-testid="card"
  >
    <CardContent
      sx={{
        width: '100%',
        alignItems: 'baseline',
      }}
      data-testid="card-content"
    >
      <Box sx={{ display: 'grid', gridColumn: 'span 12' }} data-testid="box">
        <TitleBox
          title={title}
          subTitle={subtitle}
          mbTitle={2}
          mbSubTitle={subtitle ? 3 : 5}
          variantTitle={titleVariant}
          variantSubTitle={subtitleVariant}
        />
      </Box>
      {children}
    </CardContent>
  </Card>
);

export default InitiativeOverviewCard;

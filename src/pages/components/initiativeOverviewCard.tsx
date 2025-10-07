import { Box, Card, CardContent } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
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
      display: 'grid',
      gridColumn: 'span 12'
    }}
    data-testid="card">
    <CardContent
      sx={{
        display: 'grid',
        width: '100%',
        gridTemplateColumns: 'repeat(12, 1fr)',
        alignItems: 'baseline',
        rowGap: 1
      }}
      data-testid="card-content">
      <Box sx={{ display: 'grid', gridColumn: 'span 12'}} data-testid="box">
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
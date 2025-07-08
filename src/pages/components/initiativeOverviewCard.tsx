import { Box, Card, CardContent } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { ReactNode } from 'react';
import { inititiveOverviewCardStyle,inititiveOverviewCardContentStyle } from '../../styles';


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
       titleVariant = 'h5',
       subtitleVariant = 'caption',
       }: InitiativeOverviewCardProps) => (
    <Card
      sx={{
        ...inititiveOverviewCardStyle,
      }}
    >
      <CardContent
        sx={{
          ...inititiveOverviewCardContentStyle,
        }}
      >
          <Box sx={{ display: 'grid', gridColumn: 'span 12', mt: 2 }}>
            <TitleBox
              title={title}
              subTitle={subtitle}
              mbTitle={2}
              mtTitle={2}
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
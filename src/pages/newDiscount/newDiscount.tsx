import { Box, Paper } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { genericContainerStyle } from '../../styles';

const NewDiscount = () => {
  console.log('new discount');

  return (
    <Box sx={{ ...genericContainerStyle, width: '100%' }}>
      <Box sx={{ gridColumn: 'span 12' }}>
        <TitleBox
          title={'aaa'}
          subTitle={'bbb'}
          mbTitle={2}
          mtTitle={2}
          mbSubTitle={5}
          variantTitle="h4"
          variantSubTitle="body1"
        />
      </Box>
      <Paper sx={{ gridColumn: 'span 12' }}>
        <Box sx={{ p: 2 }}>new discount</Box>
      </Paper>
    </Box>
  );
};

export default NewDiscount;

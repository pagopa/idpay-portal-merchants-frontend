/* eslint-disable no-prototype-builtins */
import { List, Box } from '@mui/material';
import { useHistory } from 'react-router-dom';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useState } from 'react';
import ROUTES from '../../routes';
import { intiativesListSelector } from '../../redux/slices/initiativesSlice';
import { useAppSelector } from '../../redux/hooks';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import SidenavItem from './SidenavItem';
import { SidenavAccordion } from './SidenavAccordion';

export default function SideMenu() {
  const [expandedItem, setExpandedItem] = useState<string>('');
  const initiativesList = useAppSelector(intiativesListSelector);
  const { t } = useScopedTranslation();
  const history = useHistory();

  return (
    <Box display="grid" mt={1}>
      <Box gridColumn="auto">
        <List data-testid="list-test">
          <SidenavItem
            title={t('pages.initiativesList.title')}
            handleClick={() => history.replace(ROUTES.HOME)}
            isSelected={history.location.pathname === ROUTES.HOME}
            icon={ListAltIcon}
            level={0}
            data-testid="initiativeList-click-test"
          />
          {initiativesList &&
            initiativesList.map((item) => (
              <SidenavAccordion
                key={item?.initiativeId}
                item={item}
                isExpanded={expandedItem}
                defaultExpanded={!(initiativesList.length - 1)}
                setIsExpanded={setExpandedItem}
              />
            ))}
        </List>
      </Box>
    </Box>
  );
}

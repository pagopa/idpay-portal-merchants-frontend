
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, List, ListItemText } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { useInitiativeConfig } from '../../hooks/useInitiativeConfig';
import { InitiativeDTO } from '../../api/generated/merchants/data-contracts';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { BASE_ROUTE } from '../../routes';
import { config } from './config';
import SidenavItem from './SidenavItem';

type Props = {
    item: InitiativeDTO
    isExpanded: boolean
}

export const SidenavAccordion = ({ item, isExpanded }: Props) => {
    const history = useHistory();
    const { initiativeConfig } = useInitiativeConfig<Array<string>>("routes", {initiativeName: item?.initiativeName || '', startDate: item?.startDate || ''});
    const { t } = useScopedTranslation();

    const { initiativeName, initiativeId } = item;
    const filteredRoutes = config.filter(({ key }) => initiativeConfig?.includes(key));
    const [firstInitiativePage] = filteredRoutes;

    return (<Accordion
        key={initiativeId}
        expanded={history.location.pathname.startsWith(`${BASE_ROUTE}/${initiativeId}`) || isExpanded}
        disableGutters
        elevation={0}
        sx={{
            border: 'none',
            '&:before': { backgroundColor: '#fff' },
            minWidth: 300,
            maxWidth: 316,
        }}
        onChange={(e) => {
            e.stopPropagation();
            history.replace(`${BASE_ROUTE}/${initiativeId}/${firstInitiativePage?.route}`);
        }}
        data-testid="accordion-click-test"
    >
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel-${initiativeId}-content`}
            id={`panel-${initiativeId}-header`}
        >
            <ListItemText sx={{ wordBreak: 'break-word' }} primary={initiativeName} />
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
            <List disablePadding>
                {filteredRoutes.map(({ key, title, route, icon, dataTestId }) =>
                    <SidenavItem
                        key={key}
                        title={t(title)}
                        handleClick={() => history.replace(`${BASE_ROUTE}/${initiativeId}/${route}`)}
                        isSelected={history.location.pathname.startsWith(`${BASE_ROUTE}/${initiativeId}/${route}`)}
                        icon={icon}
                        level={2}
                        data-testid={dataTestId}
                    />
                )}
            </List>
        </AccordionDetails>
    </Accordion>
    );
};
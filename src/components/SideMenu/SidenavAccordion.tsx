
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, List, ListItemText } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useInitiativeConfig } from '../../hooks/useInitiativeConfig';
import { InitiativeDTO } from '../../api/generated/merchants/data-contracts';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { BASE_ROUTE } from '../../routes';
import { config } from './config';
import SidenavItem from './SidenavItem';

type Props = {
    item: InitiativeDTO
    isExpanded: string
    setIsExpanded: (value: string) => void
    defaultExpanded?: boolean
}

export const SidenavAccordion = ({ item, isExpanded, setIsExpanded, defaultExpanded }: Props) => {
    const [filteredRoutes, setFilteredRoutes] = useState<typeof config>();
    const history = useHistory();
    const { getConfig } = useInitiativeConfig<Array<string>>();
    const { t } = useScopedTranslation();
    const { initiativeId, initiativeName} = item;

    useEffect(() => {
        if(item) {
        void getConfig("routes", item).then((res) => setFilteredRoutes(config.filter(({ key }) => res?.includes(key))));
        }
    }, [item]);

    return (<Accordion
        expanded={history.location.pathname.startsWith(`${BASE_ROUTE}/${initiativeId}`) || isExpanded === initiativeId || defaultExpanded}
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
            if(filteredRoutes) {
            history.replace(`${BASE_ROUTE}/${initiativeId}/${filteredRoutes[0]?.route}`);
            setIsExpanded(initiativeId || '');
            }
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
                {filteredRoutes && filteredRoutes.map(({ key, title, route, icon, dataTestId }) =>
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
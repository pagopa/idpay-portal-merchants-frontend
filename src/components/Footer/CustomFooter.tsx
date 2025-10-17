import { useTranslation } from 'react-i18next';
import { FooterPostLogin, FooterLegal } from '@pagopa/mui-italia';

const FOOTER_LINKS = {
    COMPANY: 'https://www.pagopa.it/it/',
    PRIVACY: 'https://welfare.dev.cstar.pagopa.it/portale-esercenti/privacy-policy',
    PERSONAL_DATA: 'https://privacyportal-de.onetrust.com/webform/77f17844-04c3-4969-a11d-462ee77acbe1/9ab6533d-be4a-482e-929a-0d8d2ab29df8',
    TERMS_AND_CONDITIONS: 'https://welfare.dev.cstar.pagopa.it/portale-esercenti/terms-of-service',
    A11Y: 'https://form.agid.gov.it/view/87f46790-9798-11f0-b583-8b5f76942354'
} as const;

const openExternalLink = (url: string) => window.open(url, '_blank')?.focus();

export const CustomFooter = () => {
    const { t } = useTranslation();

    return (
        <>
            <FooterPostLogin
                companyLink={{
                    ariaLabel: 'PagoPA SPA',
                    href: FOOTER_LINKS.COMPANY,
                    onClick: () => openExternalLink(FOOTER_LINKS.COMPANY)
                }}
                links={[
                    {
                        label: t('commons.footer.privacy'),
                        ariaLabel: t('commons.footer.privacy'),
                        href: FOOTER_LINKS.PRIVACY,
                        linkType: 'external',
                        onClick: () => openExternalLink(FOOTER_LINKS.PRIVACY || '')
                    },
                    {
                        label: t('commons.footer.personalData'),
                        ariaLabel: t('commons.footer.personalData'),
                        linkType: 'external',
                        href: FOOTER_LINKS.PERSONAL_DATA,
                        onClick: () => openExternalLink(FOOTER_LINKS.PERSONAL_DATA)
                    },
                    {
                        label: t('commons.footer.termsAndConditions'),
                        ariaLabel: t('commons.footer.termsAndConditions'),
                        href: FOOTER_LINKS.TERMS_AND_CONDITIONS,
                        linkType: 'external',
                        onClick: () => openExternalLink(FOOTER_LINKS.TERMS_AND_CONDITIONS || '')
                    },
                    {
                        label: t('commons.footer.a11y'),
                        ariaLabel: t('commons.footer.a11y'),
                        linkType: 'external',
                        onClick: () => openExternalLink(FOOTER_LINKS.A11Y)
                    }
                ]}
                currentLangCode={'it'}
                languages={{
                    it: {
                        it: 'Italiano'
                    }
                }}
                onLanguageChanged={() => { }}
            />
            <FooterLegal
                content={
                    <span style={{ whiteSpace: 'pre-line' }}>
                        <b>{t('commons.footer.PagoPA')}</b> - {t('commons.footer.legalInfo')}
                    </span>
                }
            />
        </>
    );
};
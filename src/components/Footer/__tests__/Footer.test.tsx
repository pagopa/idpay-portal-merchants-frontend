import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Footer from '../Footer';
import { LangCode } from '@pagopa/mui-italia';
import { pagoPALink } from '../FooterConfig';

let mockedMuiFooterProps: any;

const mockedPagoPALink = { ...pagoPALink };

jest.mock('@pagopa/mui-italia/dist/components/Footer/Footer', () => ({
  Footer: (props) => {
    mockedMuiFooterProps = props;
    return (
      <div data-testid="mui-italia-footer-mock">
        <span data-testid="logged-user-prop">{props.loggedUser.toString()}</span>
        <pre data-testid="pre-login-links-prop">{JSON.stringify(props.preLoginLinks, null, 2)}</pre>
        <pre data-testid="post-login-links-prop">
          {JSON.stringify(props.postLoginLinks, null, 2)}
        </pre>
        <button data-testid="changelang" onClick={() => props.onLanguageChanged('en')}>
          Change Lang
        </button>
        <button {...mockedPagoPALink}>Logo</button>
        <button onClick={() => props.onExit(() => {})}>Exit</button>
      </div>
    );
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  Trans: ({ i18nKey, children }: { i18nKey: string; children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@pagopa/selfcare-common-frontend/locale/locale-utils', () => ({
  __esModule: true,
  default: {
    changeLanguage: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@pagopa/selfcare-common-frontend/config/env', () => ({
  CONFIG: {
    FOOTER: {
      LINK: {
        ABOUTUS: '#aboutus',
        MEDIA: '#media',
        WORKWITHUS: '#workwithus',
        PRIVACYPOLICY: '#privacy',
        CERTIFICATIONS: '#certifications',
        INFORMATIONSECURITY: '#infosecurity',
        PROTECTIONOFPERSONALDATA: '#protection',
        COOKIES: '#cookies',
        TERMSANDCONDITIONS: '#terms',
        TRANSPARENTCOMPANY: '#transparent',
        DISCLOSUREPOLICY: '#disclosure',
        MODEL231: '#model231',
        ACCESSIBILITY: '#accessibility',
        LINKEDIN: '#linkedin',
        TWITTER: '#twitter',
        INSTAGRAM: '#instagram',
        MEDIUM: '#medium',
      },
    },
  },
}));

jest.mock('../../../utils/env', () => ({
  ENV: {
    CONFIG: {
      FOOTER: {
        LINK: {
          PRIVACYPOLICY: '#privacy-logged',
          PROTECTIONOFPERSONALDATA: '#protection-logged',
          ACCESSIBILITY: '#accessibility-logged',
        },
      },
    },
  },
}));

jest.mock('../FooterConfig', () => ({
  pagoPALink: { href: 'https://www.pagopa.it' },
  LANGUAGES: [
    { it: 'Italiano' },
    { en: 'English' },
  ],
}));

jest.mock('../../../routes', () => ({
  default: {
    PRIVACY_POLICY: '/privacy-policy',
    TOS: '/terms-of-service',
  },
}));

global.window.OneTrust = {
  ToggleInfoDisplay: jest.fn(),
};

afterEach(() => {
  mockedMuiFooterProps = undefined;
  jest.clearAllMocks();
});

describe('<Footer />', () => {
  test('should render the pre-login footer when user is not logged', () => {
    render(<Footer loggedUser={false} />);

    const muiFooter = screen.getByTestId('mui-italia-footer-mock');
    expect(muiFooter).toBeInTheDocument();

    expect(screen.getByTestId('logged-user-prop')).toHaveTextContent('false');

    const preLoginLinks = screen.getByTestId('pre-login-links-prop');
    expect(preLoginLinks).toHaveTextContent('common.footer.preLoginLinks.aboutUs.links.aboutUs');
    expect(preLoginLinks).toHaveTextContent(
      'common.footer.preLoginLinks.resources.links.privacyPolicy'
    );
  });

  test('should render the post-login footer when user is logged', () => {
    render(<Footer loggedUser={true} />);

    const muiFooter = screen.getByTestId('mui-italia-footer-mock');
    expect(muiFooter).toBeInTheDocument();

    expect(screen.getByTestId('logged-user-prop')).toHaveTextContent('true');

    const postLoginLinks = screen.getByTestId('post-login-links-prop');
    expect(postLoginLinks).toHaveTextContent('common.footer.postLoginLinks.privacyPolicy');
    expect(postLoginLinks).toHaveTextContent('common.footer.postLoginLinks.termsandconditions');
  });

  test('should call onExit prop when the exit action is triggered', () => {
    const onExitMock = jest.fn((exitAction) => exitAction());
    const mockExitAction = jest.fn();
    render(<Footer loggedUser={true} onExit={onExitMock} />);

    expect(mockedMuiFooterProps.onExit).toBeDefined();
    mockedMuiFooterProps.onExit(mockExitAction);

    expect(onExitMock).toHaveBeenCalledWith(mockExitAction);
  });

  test('should call window.OneTrust.ToggleInfoDisplay when cookie preferences link is clicked', () => {
    render(<Footer loggedUser={false} />);

    const cookieLink = mockedMuiFooterProps.preLoginLinks.resources.links.find(
      (link: any) => link.label === 'common.footer.preLoginLinks.resources.links.cookies'
    );

    expect(cookieLink).toBeDefined();
    cookieLink?.onClick();

    expect(window.OneTrust.ToggleInfoDisplay).toHaveBeenCalledTimes(1);
  });

  test('should render and pass correct props for non-logged user', () => {
    render(<Footer loggedUser={false} />);
    expect(screen.getByTestId('mui-italia-footer-mock')).toBeInTheDocument();

    expect(mockedMuiFooterProps.loggedUser).toBe(false);
    expect(mockedMuiFooterProps.preLoginLinks.aboutUs.links[0].label).toBe(
      'common.footer.preLoginLinks.aboutUs.links.aboutUs'
    );
  });

  test('should render and pass correct props for logged user', () => {
    render(<Footer loggedUser={true} />);
    expect(screen.getByTestId('mui-italia-footer-mock')).toBeInTheDocument();

    expect(mockedMuiFooterProps.loggedUser).toBe(true);
    expect(mockedMuiFooterProps.postLoginLinks[0].label).toBe(
      'common.footer.postLoginLinks.privacyPolicy'
    );
  });

  test('should call i18n.changeLanguage when onLanguageChanged is triggered', async () => {
    const i18nModule = require('@pagopa/selfcare-common-frontend/locale/locale-utils');
    render(<Footer loggedUser={false} />);

    expect(mockedMuiFooterProps.onLanguageChanged).toBeDefined();

    await act(async () => {
      await mockedMuiFooterProps.onLanguageChanged('en' as LangCode);
    });

    expect(i18nModule.default.changeLanguage).toHaveBeenCalledWith('en');
  });

  test('should update selectedLanguage state when onLanguageChanged is called', async () => {
    const { rerender } = render(<Footer loggedUser={false} />);
    expect(mockedMuiFooterProps.currentLangCode).toBeUndefined();

    await act(async () => {
      await mockedMuiFooterProps.onLanguageChanged('en' as LangCode);
    });

    rerender(<Footer loggedUser={false} />);
    expect(mockedMuiFooterProps.currentLangCode).toBe('en');
  });

  test('should pass productsJsonUrl prop to MuiItaliaFooter', () => {
    const testUrl = 'https://example.com/products.json';
    render(<Footer loggedUser={false} productsJsonUrl={testUrl} />);

    expect(mockedMuiFooterProps.productsJsonUrl).toBe(testUrl);
  });
});
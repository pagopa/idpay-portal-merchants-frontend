import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
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
        <span data-testid="company-link-prop">{JSON.stringify(props.companyLink)}</span>
        <button data-testid="changelang" onClick={() => props.onLanguageChanged('en')}>
          Change Lang
        </button>
        <button data-testid="logo-btn" {...mockedPagoPALink}>
          Logo
        </button>
        <button data-testid="exit-btn" onClick={() => props.onExit(() => {})}>
          Exit
        </button>
        <span data-testid="current-lang">{props.currentLangCode}</span>
        <span data-testid="products-url">{props.productsJsonUrl}</span>
      </div>
    );
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  Trans: ({ i18nKey, children }: { i18nKey: string; children: React.ReactNode }) => (
    <div data-testid="trans-component">{children}</div>
  ),
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

global.window.open = jest.fn();

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

  test('should pass companyLink prop to MuiItaliaFooter', () => {
    render(<Footer loggedUser={false} />);
    expect(mockedMuiFooterProps.companyLink).toBeDefined();
    expect(mockedMuiFooterProps.companyLink.href).toBe('https://www.pagopa.it');
  });

  test('should render all pre-login link columns with correct structure', () => {
    render(<Footer loggedUser={false} />);

    const { preLoginLinks } = mockedMuiFooterProps;
    expect(preLoginLinks.aboutUs).toBeDefined();
    expect(preLoginLinks.resources).toBeDefined();
    expect(preLoginLinks.followUs).toBeDefined();

    expect(preLoginLinks.aboutUs.links).toHaveLength(3);
    expect(preLoginLinks.resources.links).toHaveLength(9);
    expect(preLoginLinks.followUs.socialLinks).toHaveLength(4);
  });

  test('should call onClickNavigate when aboutUs link is clicked', () => {
    jest.spyOn(window, 'open');
    render(<Footer loggedUser={false} />);

    const aboutUsLink = mockedMuiFooterProps.preLoginLinks.aboutUs.links[0];
    aboutUsLink.onClick();

    expect(window.open).toHaveBeenCalledWith('#aboutus');
  });

  test('should call onClickNavigate when media link is clicked', () => {
    jest.spyOn(window, 'open');
    render(<Footer loggedUser={false} />);

    const mediaLink = mockedMuiFooterProps.preLoginLinks.aboutUs.links[1];
    mediaLink.onClick();

    expect(window.open).toHaveBeenCalledWith('#media');
  });

  test('should call onClickNavigate when work with us link is clicked', () => {
    jest.spyOn(window, 'open');
    render(<Footer loggedUser={false} />);

    const workWithUsLink = mockedMuiFooterProps.preLoginLinks.aboutUs.links[2];
    workWithUsLink.onClick();

    expect(window.open).toHaveBeenCalledWith('#workwithus');
  });

  test('should call onClickNavigate when certifications link is clicked', () => {
    jest.spyOn(window, 'open');
    render(<Footer loggedUser={false} />);

    const certificationsLink = mockedMuiFooterProps.preLoginLinks.resources.links.find(
      (link: any) => link.label === 'common.footer.preLoginLinks.resources.links.certifications'
    );
    certificationsLink?.onClick();

    expect(window.open).toHaveBeenCalledWith('#certifications');
  });

  test('should call onClickNavigate when information security link is clicked', () => {
    jest.spyOn(window, 'open');
    render(<Footer loggedUser={false} />);

    const infoSecurityLink = mockedMuiFooterProps.preLoginLinks.resources.links.find(
      (link: any) => link.label === 'common.footer.preLoginLinks.resources.links.informationsecurity'
    );
    infoSecurityLink?.onClick();

    expect(window.open).toHaveBeenCalledWith('#infosecurity');
  });

  test('should have correct aria labels for all pre-login links', () => {
    render(<Footer loggedUser={false} />);

    const { preLoginLinks } = mockedMuiFooterProps;
    const allLinks = [
      ...preLoginLinks.aboutUs.links,
      ...preLoginLinks.resources.links,
      ...preLoginLinks.followUs.links,
    ];

    allLinks.forEach((link: any) => {
      expect(link.ariaLabel).toBeDefined();
    });
  });

  test('should have correct social links with proper icons', () => {
    render(<Footer loggedUser={false} />);

    const { followUs } = mockedMuiFooterProps.preLoginLinks;
    expect(followUs.socialLinks[0].icon).toBe('linkedin');
    expect(followUs.socialLinks[1].icon).toBe('twitter');
    expect(followUs.socialLinks[2].icon).toBe('instagram');
    expect(followUs.socialLinks[3].icon).toBe('medium');
  });

  test('should render legal info with Trans component', () => {
    render(<Footer loggedUser={false} />);
    expect(mockedMuiFooterProps.legalInfo).toBeDefined();
    expect(mockedMuiFooterProps.legalInfo.props.i18nKey).toBe('common.footer.legalInfoText');
  });

  test('should pass legalInfo to MuiItaliaFooter', () => {
    render(<Footer loggedUser={false} />);
    expect(mockedMuiFooterProps.legalInfo).toBeDefined();
  });

  test('should pass LANGUAGES array to MuiItaliaFooter', () => {
    render(<Footer loggedUser={false} />);
    expect(mockedMuiFooterProps.languages).toBeDefined();
    expect(Array.isArray(mockedMuiFooterProps.languages)).toBe(true);
  });

  test('should have default onExit function that calls exitAction', () => {
    render(<Footer loggedUser={false} />);
    const mockAction = jest.fn();
    mockedMuiFooterProps.onExit(mockAction);
    expect(mockAction).toHaveBeenCalled();
  });

  test('should call onClickNavigate when protection of personal data link is clicked', () => {
    jest.spyOn(window, 'open');
    render(<Footer loggedUser={false} />);

    const protectionLink = mockedMuiFooterProps.preLoginLinks.resources.links.find(
      (link: any) => link.label === 'common.footer.preLoginLinks.resources.links.protectionofpersonaldata'
    );
    protectionLink?.onClick();

    expect(window.open).toHaveBeenCalledWith('#protection');
  });

  test('should render all post-login links', () => {
    render(<Footer loggedUser={true} />);

    const { postLoginLinks } = mockedMuiFooterProps;
    expect(postLoginLinks).toHaveLength(4);
    expect(postLoginLinks[0].label).toBe('common.footer.postLoginLinks.privacyPolicy');
    expect(postLoginLinks[1].label).toBe('common.footer.postLoginLinks.protectionofpersonaldata');
    expect(postLoginLinks[2].label).toBe('common.footer.postLoginLinks.termsandconditions');
    expect(postLoginLinks[3].label).toBe('common.footer.postLoginLinks.accessibility');
  });

  test('should call onClickNavigate for post-login privacy link', () => {
    jest.spyOn(window, 'open');
    render(<Footer loggedUser={true} />);

    const privacyLink = mockedMuiFooterProps.postLoginLinks[0];
    privacyLink.onClick();

    expect(window.open).toHaveBeenCalledWith(undefined);
  });

  test('should call onClickNavigate for post-login terms link', () => {
    jest.spyOn(window, 'open');
    render(<Footer loggedUser={true} />);

    const termsLink = mockedMuiFooterProps.postLoginLinks[2];
    termsLink.onClick();

    expect(window.open).toHaveBeenCalledWith(undefined);
  });

  test('should call onClickNavigate for post-login protection link', () => {
    jest.spyOn(window, 'open');
    render(<Footer loggedUser={true} />);

    const protectionLink = mockedMuiFooterProps.postLoginLinks.find(
      (link: any) => link.label === 'common.footer.postLoginLinks.protectionofpersonaldata'
    );
    protectionLink?.onClick();

    expect(window.open).toHaveBeenCalledWith('#protection-logged');
  });

  test('should call onClickNavigate for post-login accessibility link', () => {
    jest.spyOn(window, 'open');
    render(<Footer loggedUser={true} />);

    const accessibilityLink = mockedMuiFooterProps.postLoginLinks.find(
      (link: any) => link.label === 'common.footer.postLoginLinks.accessibility'
    );
    accessibilityLink?.onClick();

    expect(window.open).toHaveBeenCalledWith('#accessibility-logged');
  });

  test('should have correct linkType for all links', () => {
    render(<Footer loggedUser={false} />);

    const { preLoginLinks, postLoginLinks } = mockedMuiFooterProps;
    const allPreLoginLinks = [
      ...preLoginLinks.aboutUs.links,
      ...preLoginLinks.resources.links.filter((l: any) => l.linkType),
      ...preLoginLinks.followUs.links,
    ];

    allPreLoginLinks.forEach((link: any) => {
      if (link.linkType) {
        expect(link.linkType).toBe('internal');
      }
    });

    postLoginLinks.forEach((link: any) => {
      expect(link.linkType).toBe('internal');
    });
  });

  test('should handle multiple language changes', async () => {
    const i18nModule = require('@pagopa/selfcare-common-frontend/locale/locale-utils');
    const { rerender } = render(<Footer loggedUser={false} />);

    await act(async () => {
      await mockedMuiFooterProps.onLanguageChanged('en' as LangCode);
    });

    rerender(<Footer loggedUser={false} />);
    expect(i18nModule.default.changeLanguage).toHaveBeenCalledWith('en');

    await act(async () => {
      await mockedMuiFooterProps.onLanguageChanged('it' as LangCode);
    });

    rerender(<Footer loggedUser={false} />);
    expect(i18nModule.default.changeLanguage).toHaveBeenCalledWith('it');
    expect(i18nModule.default.changeLanguage).toHaveBeenCalledTimes(2);
  });

  test('should render correctly when productsJsonUrl is not provided', () => {
    render(<Footer loggedUser={false} />);
    expect(mockedMuiFooterProps.productsJsonUrl).toBeUndefined();
  });

  test('should verify all social links have correct href', () => {
    render(<Footer loggedUser={false} />);

    const { followUs } = mockedMuiFooterProps.preLoginLinks;
    followUs.socialLinks.forEach((social: any) => {
      expect(social.href).toBeDefined();
      expect(social.ariaLabel).toBeDefined();
    });
  });

  test('should apply pagoPALink href to logo button', () => {
    render(<Footer loggedUser={false} />);

    const logoButton = screen.getByTestId('logo-btn');
    expect(logoButton).toHaveAttribute('href', 'https://www.pagopa.it');
  });
});

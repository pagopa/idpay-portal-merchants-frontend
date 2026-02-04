import { pagoPALink, LANGUAGES } from '../FooterConfig';
import { CONFIG } from '@pagopa/selfcare-common-frontend/config/env';

jest.mock('@pagopa/selfcare-common-frontend/config/env', () => ({
  CONFIG: {
    FOOTER: {
      LINK: {
        PAGOPALINK: 'https://www.pagopa.it',
      },
    },
  },
}));

describe('pagoPALink', () => {
  beforeEach(() => {
    global.window.open = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct href from CONFIG', () => {
    expect(pagoPALink.href).toBe(CONFIG.FOOTER.LINK.PAGOPALINK);
    expect(pagoPALink.href).toBe('https://www.pagopa.it');
  });

  it('should have correct ariaLabel', () => {
    expect(pagoPALink.ariaLabel).toBe('Link: vai al sito di PagoPA S.p.A.');
  });

  it('should have onClick function', () => {
    expect(pagoPALink.onClick).toBeDefined();
    expect(typeof pagoPALink.onClick).toBe('function');
  });

  it('should call window.open with correct URL when onClick is triggered', () => {
    pagoPALink.onClick!();

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(CONFIG.FOOTER.LINK.PAGOPALINK);
  });

  it('should match CompanyLinkType structure', () => {
    expect(pagoPALink).toMatchObject({
      href: expect.any(String),
      ariaLabel: expect.any(String),
      onClick: expect.any(Function),
    });
  });
});

describe('LANGUAGES', () => {
  it('should have Italian language configuration', () => {
    expect(LANGUAGES).toHaveProperty('it');
    expect(LANGUAGES.it).toBeDefined();
  });

  it('should have correct Italian translations', () => {
    expect(LANGUAGES.it).toEqual({
      it: 'Italiano',
    });
  });

  it('should only contain Italian language', () => {
    const keys = Object.keys(LANGUAGES);
    expect(keys).toHaveLength(1);
    expect(keys).toContain('it');
  });

  it('should have Italian translation for Italian', () => {
    expect(LANGUAGES.it.it).toBe('Italiano');
  });

  it('should match expected structure', () => {
    expect(LANGUAGES).toMatchObject({
      it: {
        it: expect.any(String),
      },
    });
  });
});
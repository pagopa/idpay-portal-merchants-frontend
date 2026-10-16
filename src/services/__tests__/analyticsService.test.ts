/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-nocheck
const mockMixpanelInstance = {
  has_opted_out_tracking: jest.fn(),
  clear_opt_in_out_tracking: jest.fn(),
  set_config: jest.fn(),
  track_pageview: jest.fn(),
  track: jest.fn(),
  unregister: jest.fn(),
  register: jest.fn(),
  opt_out_tracking: jest.fn(),
};

const mockMixpanel = {
  init: jest.fn(() => mockMixpanelInstance),
};

const mockBrowserConsole = {
  warn: jest.fn(),
};

jest.mock('mixpanel-browser', () => ({
  __esModule: true,
  default: mockMixpanel,
}));

jest.mock('../../utils/consoleLogger', () => ({
  browserConsole: mockBrowserConsole,
}));

const loadAnalyticsService = () => {
  let service: typeof import('../analyticsService');

  jest.isolateModules(() => {
    service = require('../analyticsService');
  });

  return service!;
};

describe('analyticsService', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    delete process.env.REACT_APP_MIXPANEL_ENABLE;
    delete process.env.REACT_APP_MIXPANEL_TOKEN;
    delete process.env.REACT_APP_MIXPANEL_API_HOST;
    delete process.env.REACT_APP_MIXPANEL_DEBUG;

    mockMixpanelInstance.has_opted_out_tracking.mockReturnValue(false);
    mockMixpanel.init.mockReturnValue(mockMixpanelInstance);
  });

  it('does nothing when analytics is disabled', () => {
    const {
      clearInitiativeAnalyticsProperties,
      initAnalytics,
      registerInitiativeAnalyticsProperties,
      syncInitiativeAnalyticsProperties,
      trackAnalyticsEvent,
      trackAnalyticsPageView,
    } = loadAnalyticsService();

    initAnalytics();
    trackAnalyticsPageView('/test');
    trackAnalyticsEvent('IDPAY_LOAD_INVOICE_UX_SUCCESS');
    clearInitiativeAnalyticsProperties();
    registerInitiativeAnalyticsProperties('Initiative', 'initiative-id');
    syncInitiativeAnalyticsProperties('Initiative', 'initiative-id');

    expect(mockMixpanel.init).not.toHaveBeenCalled();
    expect(mockMixpanelInstance.track_pageview).not.toHaveBeenCalled();
    expect(mockMixpanelInstance.track).not.toHaveBeenCalled();
    expect(mockMixpanelInstance.unregister).not.toHaveBeenCalled();
    expect(mockMixpanelInstance.register).not.toHaveBeenCalled();
  });

  it('skips initialization and warns when the Mixpanel token is missing', () => {
    process.env.REACT_APP_MIXPANEL_ENABLE = 'true';
    const { initAnalytics } = loadAnalyticsService();

    initAnalytics();

    expect(mockMixpanel.init).not.toHaveBeenCalled();
    expect(mockBrowserConsole.warn).toHaveBeenCalledWith(
      '[Mixpanel] Missing REACT_APP_MIXPANEL_TOKEN: analytics initialization skipped.'
    );
  });

  it('initializes analytics and tracks pages, events and initiative properties', () => {
    process.env.REACT_APP_MIXPANEL_ENABLE = 'true';
    process.env.REACT_APP_MIXPANEL_TOKEN = 'mixpanel-token';
    process.env.REACT_APP_MIXPANEL_API_HOST = 'https://custom.mixpanel.test';
    process.env.REACT_APP_MIXPANEL_DEBUG = 'true';

    const {
      clearInitiativeAnalyticsProperties,
      initAnalytics,
      registerInitiativeAnalyticsProperties,
      syncInitiativeAnalyticsProperties,
      trackAnalyticsEvent,
      trackAnalyticsPageView,
    } = loadAnalyticsService();

    initAnalytics();

    expect(mockMixpanel.init).toHaveBeenCalledWith(
      'mixpanel-token',
      expect.objectContaining({
        api_host: 'https://custom.mixpanel.test',
        debug: true,
        persistence: 'localStorage',
        track_pageview: false,
        property_blacklist: expect.arrayContaining(['$current_url']),
        hooks: expect.objectContaining({
          before_send_events: expect.any(Function),
        }),
        autocapture: expect.objectContaining({
          capture_text_content: true,
          capture_extra_attrs: ['name'],
          allow_element_callback: expect.any(Function),
          block_attrs: [
            'aria-label',
            'aria-labelledby',
            'aria-describedby',
            'title',
            'role',
          ],
        }),
      }),
      'analytics'
    );

    trackAnalyticsPageView('/portale-esercenti/test');
    trackAnalyticsEvent('IDPAY_LOAD_INVOICE_UX_SUCCESS', {
      count: 1,
      successful: true,
      optional: null,
    });
    clearInitiativeAnalyticsProperties();
    registerInitiativeAnalyticsProperties('Test initiative', 'initiative-id');
    syncInitiativeAnalyticsProperties('Synced initiative', 'synced-id');

    expect(mockMixpanelInstance.track_pageview).toHaveBeenCalledWith({
      current_url_path: '/portale-esercenti/test',
    });
    expect(mockMixpanelInstance.track).toHaveBeenCalledWith(
      'IDPAY_LOAD_INVOICE_UX_SUCCESS',
      {
        count: 1,
        successful: true,
        optional: null,
      }
    );
    expect(mockMixpanelInstance.unregister).toHaveBeenCalledWith('initiative_name');
    expect(mockMixpanelInstance.unregister).toHaveBeenCalledWith('initiative_id');
    expect(mockMixpanelInstance.register).toHaveBeenCalledWith({
      initiative_name: 'Test initiative',
      initiative_id: 'initiative-id',
    });
    expect(mockMixpanelInstance.register).toHaveBeenCalledWith({
      initiative_id: 'synced-id',
    });
    expect(mockMixpanelInstance.register).toHaveBeenCalledWith({
      initiative_name: 'Synced initiative',
    });

    const [, initConfig] = mockMixpanel.init.mock.calls[0];
    expect(initConfig.property_blacklist).not.toContain('$pathname');
    const allowElementCallback = initConfig.autocapture.allow_element_callback;
    const button = document.createElement('button');
    const link = document.createElement('a');
    const imageInsideLink = document.createElement('img');
    link.appendChild(imageInsideLink);
    const clickableImage = document.createElement('img');
    clickableImage.onclick = jest.fn();
    const submitInput = document.createElement('input');
    submitInput.setAttribute('type', 'submit');
    const genericDiv = document.createElement('div');

    expect(allowElementCallback(button, new MouseEvent('click'))).toBe(true);
    expect(allowElementCallback(link, new MouseEvent('click'))).toBe(true);
    expect(allowElementCallback(imageInsideLink, new MouseEvent('click'))).toBe(true);
    expect(allowElementCallback(clickableImage, new MouseEvent('click'))).toBe(true);
    expect(allowElementCallback(submitInput, new MouseEvent('click'))).toBe(true);
    expect(allowElementCallback(genericDiv, new MouseEvent('click'))).toBe(false);
    expect(allowElementCallback(genericDiv, new Event('change'))).toBe(true);

    expect(initConfig.hooks.before_send_events({
      event: '$mp_web_page_view',
      properties: {
        $pathname: '/portale-esercenti/initiative-1/punti-vendita/store-42',
        current_url_path: '/portale-esercenti/initiative-1/punti-vendita/store-42',
      },
    })).toEqual({
      event: '$mp_web_page_view',
      properties: {
        $pathname: '/portale-esercenti/initiative-1/punti-vendita',
        current_url_path: '/portale-esercenti/initiative-1/punti-vendita',
      },
    });
    expect(initConfig.hooks.before_send_events({
      event: '$mp_input_change',
      properties: {
        $pathname: '/portale-esercenti/punti-vendita',
        $el_attr__name: 'associated',
      },
    })).toEqual({
      event: '$mp_input_change',
      properties: {
        $pathname: '/portale-esercenti/punti-vendita',
        $el_attr__name: 'associated',
        current_url_path: undefined,
        field_name: 'associated',
      },
    });
  });

  it('does not register incomplete initiative properties', () => {
    process.env.REACT_APP_MIXPANEL_ENABLE = 'true';
    process.env.REACT_APP_MIXPANEL_TOKEN = 'mixpanel-token';

    const {
      initAnalytics,
      registerInitiativeAnalyticsProperties,
      syncInitiativeAnalyticsProperties,
    } = loadAnalyticsService();

    initAnalytics();
    mockMixpanelInstance.register.mockClear();

    registerInitiativeAnalyticsProperties();
    registerInitiativeAnalyticsProperties('Initiative');
    registerInitiativeAnalyticsProperties(undefined, 'initiative-id');
    syncInitiativeAnalyticsProperties();

    expect(mockMixpanelInstance.register).not.toHaveBeenCalled();
  });

  it('registers only the initiative properties that are provided during sync', () => {
    process.env.REACT_APP_MIXPANEL_ENABLE = 'true';
    process.env.REACT_APP_MIXPANEL_TOKEN = 'mixpanel-token';

    const {
      initAnalytics,
      syncInitiativeAnalyticsProperties,
    } = loadAnalyticsService();

    initAnalytics();
    mockMixpanelInstance.register.mockClear();

    syncInitiativeAnalyticsProperties(undefined, 'initiative-id');

    expect(mockMixpanelInstance.register).toHaveBeenCalledTimes(1);
    expect(mockMixpanelInstance.register).toHaveBeenCalledWith({
      initiative_id: 'initiative-id',
    });

    mockMixpanelInstance.register.mockClear();

    syncInitiativeAnalyticsProperties('Initiative', undefined);

    expect(mockMixpanelInstance.register).toHaveBeenCalledTimes(1);
    expect(mockMixpanelInstance.register).toHaveBeenCalledWith({
      initiative_name: 'Initiative',
    });
  });

  it('resumes opted-out analytics and avoids reinitializing an active instance', () => {
    process.env.REACT_APP_MIXPANEL_ENABLE = 'true';
    process.env.REACT_APP_MIXPANEL_TOKEN = 'mixpanel-token';
    mockMixpanelInstance.has_opted_out_tracking.mockReturnValue(true);

    const { initAnalytics } = loadAnalyticsService();

    initAnalytics();
    initAnalytics();

    expect(mockMixpanel.init).toHaveBeenCalledTimes(1);
    expect(mockMixpanelInstance.clear_opt_in_out_tracking).toHaveBeenCalledTimes(1);
    expect(mockMixpanelInstance.set_config).toHaveBeenCalledWith({
      autocapture: expect.objectContaining({
        click: true,
        input: true,
        submit: true,
        capture_text_content: true,
        capture_extra_attrs: ['name'],
        allow_element_callback: expect.any(Function),
        block_attrs: [
          'aria-label',
          'aria-labelledby',
          'aria-describedby',
          'title',
          'role',
        ],
      }),
    });
  });

  it('tracks input changes only when analytics is active', () => {
    process.env.REACT_APP_MIXPANEL_ENABLE = 'true';
    process.env.REACT_APP_MIXPANEL_TOKEN = 'mixpanel-token';

    const { disableAnalytics, initAnalytics, trackAnalyticsInputChange } = loadAnalyticsService();

    trackAnalyticsInputChange('initiative', 'value');
    expect(mockMixpanelInstance.track).not.toHaveBeenCalled();

    initAnalytics();
    mockMixpanelInstance.track.mockClear();

    trackAnalyticsInputChange('initiative', 'value', 'select');

    expect(mockMixpanelInstance.track).toHaveBeenCalledWith('$mp_input_change', {
      $el_attr__name: 'initiative',
      input_value: 'value',
      input_type: 'select',
    });

    mockMixpanelInstance.track.mockClear();
    disableAnalytics();
    trackAnalyticsInputChange('initiative', 'value', 'select');

    expect(mockMixpanelInstance.track).not.toHaveBeenCalled();
  });

  it('allows clickable images via onclick attribute and blocks non-clickable input types', () => {
    process.env.REACT_APP_MIXPANEL_ENABLE = 'true';
    process.env.REACT_APP_MIXPANEL_TOKEN = 'mixpanel-token';

    const { initAnalytics } = loadAnalyticsService();

    initAnalytics();

    const [, initConfig] = mockMixpanel.init.mock.calls[0];
    const allowElementCallback = initConfig.autocapture.allow_element_callback;
    const imageWithOnclickAttribute = document.createElement('img');
    imageWithOnclickAttribute.setAttribute('onclick', 'handleClick()');
    const plainImage = document.createElement('img');
    const textInput = document.createElement('input');
    textInput.setAttribute('type', 'text');
    const inputWithoutType = document.createElement('input');

    expect(allowElementCallback(imageWithOnclickAttribute, new MouseEvent('click'))).toBe(true);
    expect(allowElementCallback(plainImage, new MouseEvent('click'))).toBe(false);
    expect(allowElementCallback(textInput, new MouseEvent('click'))).toBe(false);
    expect(allowElementCallback(inputWithoutType, new MouseEvent('click'))).toBe(false);
  });

  it('opts out of tracking and resumes a previously initialized instance', () => {
    process.env.REACT_APP_MIXPANEL_ENABLE = 'true';
    process.env.REACT_APP_MIXPANEL_TOKEN = 'mixpanel-token';

    const { disableAnalytics, initAnalytics, trackAnalyticsEvent } =
      loadAnalyticsService();

    initAnalytics();
    disableAnalytics();

    expect(mockMixpanelInstance.opt_out_tracking).toHaveBeenCalledTimes(1);

    trackAnalyticsEvent('IDPAY_LOAD_INVOICE_UX_SUCCESS');
    expect(mockMixpanelInstance.track).not.toHaveBeenCalled();

    initAnalytics();

    expect(mockMixpanel.init).toHaveBeenCalledTimes(1);
    expect(mockMixpanelInstance.has_opted_out_tracking).toHaveBeenCalledTimes(2);
  });

  it('does not disable analytics when it has not been initialized', () => {
    const { disableAnalytics } = loadAnalyticsService();

    disableAnalytics();

    expect(mockMixpanelInstance.opt_out_tracking).not.toHaveBeenCalled();
  });

  it('exposes the full required Mixpanel event map', () => {
    const { MIXPANEL_EVENTS } = loadAnalyticsService();

    expect(Object.values(MIXPANEL_EVENTS)).toEqual(
      expect.arrayContaining([
        'IDPAY_BONUS_ACCEPTANCE_UX_SUCCESS',
        'IDPAY_BONUS_ACCEPTANCE_UX_DENIED',
        'IDPAY_IBAN_UX_SUCCESS',
        'IDPAY_IBAN_UPDATE_SUCCESS',
        'IDPAY_EMAIL_UX_SUCCESS',
        'IDPAY_EMAIL_UPDATE_UX_SUCCESS',
        'IDPAY_NEW_STORES_UX_SUCCESS',
        'IDPAY_ADD_STORE_UX_CONVERSION',
        'IDPAY_ADD_STORE_ERROR',
        'IDPAY_ADD_STORE_UX_SUCCESS',
        'IDPAY_LOAD_INVOICE_UX_START_FLOW',
        'IDPAY_LOAD_INVOICE_UX_SUCCESS',
        'IDPAY_LOAD_INVOICE_ERROR',
        'IDPAY_INVOICE_SENT_UX_SUCCESS',
        'IDPAY_INVOICE_SENT_ERROR',
      ])
    );
  });
});

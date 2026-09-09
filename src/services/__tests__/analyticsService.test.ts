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

jest.mock('mixpanel-browser', () => ({
  __esModule: true,
  default: mockMixpanel,
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
    trackAnalyticsEvent('IDPAY_ADD_STORE_UX_SUCCESS');
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
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    initAnalytics();

    expect(mockMixpanel.init).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
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
      }),
      'analytics'
    );

    trackAnalyticsPageView('/portale-esercenti/test');
    trackAnalyticsEvent('IDPAY_ADD_STORE_UX_SUCCESS', {
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
      'IDPAY_ADD_STORE_UX_SUCCESS',
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
      }),
    });
  });

  it('opts out of tracking and resumes a previously initialized instance', () => {
    process.env.REACT_APP_MIXPANEL_ENABLE = 'true';
    process.env.REACT_APP_MIXPANEL_TOKEN = 'mixpanel-token';

    const { disableAnalytics, initAnalytics, trackAnalyticsEvent } =
      loadAnalyticsService();

    initAnalytics();
    disableAnalytics();

    expect(mockMixpanelInstance.opt_out_tracking).toHaveBeenCalledTimes(1);

    trackAnalyticsEvent('IDPAY_ADD_STORE_UX_SUCCESS');
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
});

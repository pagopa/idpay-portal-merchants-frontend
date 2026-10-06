// @ts-nocheck
const mockInitAnalytics = jest.fn();
const mockDisableAnalytics = jest.fn();

jest.mock('../services/analyticsService', () => ({
  initAnalytics: mockInitAnalytics,
  disableAnalytics: mockDisableAnalytics,
}));

const loadConfiguration = () => {
  jest.isolateModules(() => {
    require('../mixpanelConfiguration');
  });
};

describe('mixpanelConfiguration', () => {
  let onConsentChangedMock: jest.Mock;
  let previousOptanonWrapper: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    onConsentChangedMock = jest.fn();
    previousOptanonWrapper = jest.fn();

    delete window.OneTrust;
    delete window.OnetrustActiveGroups;
    window.OptanonWrapper = previousOptanonWrapper;
  });

  afterEach(() => {
    delete window.OneTrust;
    delete window.OnetrustActiveGroups;
    delete window.OptanonWrapper;
  });

  it('registers the wrapper and disables analytics without consent', () => {
    loadConfiguration();

    expect(mockDisableAnalytics).not.toHaveBeenCalled();
    expect(mockInitAnalytics).not.toHaveBeenCalled();
    expect(window.OptanonWrapper).toEqual(expect.any(Function));

    window.OptanonWrapper!();

    expect(previousOptanonWrapper).toHaveBeenCalledTimes(1);
    expect(mockDisableAnalytics).toHaveBeenCalledTimes(1);
    expect(mockInitAnalytics).not.toHaveBeenCalled();
  });

  it('initializes analytics when the analytics consent group is active', () => {
    window.OnetrustActiveGroups = 'C0002, C0001, C0003';
    window.OneTrust = {
      OnConsentChanged: onConsentChangedMock,
    };

    loadConfiguration();

    expect(mockInitAnalytics).toHaveBeenCalledTimes(1);
    expect(mockDisableAnalytics).not.toHaveBeenCalled();
    expect(onConsentChangedMock).toHaveBeenCalledTimes(1);
    expect(onConsentChangedMock).toHaveBeenCalledWith(expect.any(Function));
  });

  it('disables analytics when consent changes and the analytics group is not active', () => {
    window.OnetrustActiveGroups = 'C0001';
    window.OneTrust = {
      OnConsentChanged: onConsentChangedMock,
    };

    loadConfiguration();
    expect(mockInitAnalytics).toHaveBeenCalledTimes(1);

    window.OnetrustActiveGroups = 'C0002';
    const consentCallback = onConsentChangedMock.mock.calls[0][0];
    consentCallback();

    expect(mockDisableAnalytics).toHaveBeenCalledTimes(1);
    expect(mockInitAnalytics).toHaveBeenCalledTimes(1);
  });

  it('does not register the consent listener twice through the wrapper', () => {
    window.OneTrust = {
      OnConsentChanged: onConsentChangedMock,
    };

    loadConfiguration();

    expect(onConsentChangedMock).toHaveBeenCalledTimes(1);
    const wrapper = window.OptanonWrapper!;

    wrapper();
    wrapper();

    expect(onConsentChangedMock).toHaveBeenCalledTimes(1);
    expect(mockDisableAnalytics).toHaveBeenCalledTimes(3);
  });
});

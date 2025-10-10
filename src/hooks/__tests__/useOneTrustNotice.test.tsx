import { renderHook, act } from '@testing-library/react-hooks';
import { useOneTrustNotice } from '../useOneTrustNotice';

const mockOneTrust = {
  NoticeApi: {
    Initialized: Promise.resolve(),
    LoadNotices: jest.fn(),
  },
};

(global as any).OneTrust = mockOneTrust;

describe('useOneTrustNotice', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should initialize and load notices on mount, then call setContentLoaded', async () => {
    const setContentLoaded = jest.fn();
    const testUrl = 'https://example.com/notice';

    renderHook(() => useOneTrustNotice(testUrl, false, setContentLoaded, ''));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockOneTrust.NoticeApi.LoadNotices).toHaveBeenCalledWith([testUrl], false);
    expect(mockOneTrust.NoticeApi.LoadNotices).toHaveBeenCalledTimes(1);
    expect(setContentLoaded).toHaveBeenCalledWith(true);
    expect(setContentLoaded).toHaveBeenCalledTimes(1);
  });

  test('should modify DOM elements after a delay when content is loaded', () => {
    document.body.innerHTML = `
      <div class="otnotice-content">
        <a href="#internal-section">Link Interno</a>
        <a href="https://www.google.com">Link Esterno</a>
      </div>
      <div class="otnotice-menu"></div>
    `;

    const setContentLoaded = jest.fn();
    const urlPrefix = '/prefix';

    const { rerender } = renderHook(
      (props) =>
        useOneTrustNotice(props.url, props.contentLoaded, props.setContentLoaded, props.urlPrefix),
      {
        initialProps: {
          url: 'test-url',
          contentLoaded: false,
          setContentLoaded,
          urlPrefix,
        },
      }
    );

    rerender({
      url: 'test-url',
      contentLoaded: true,
      setContentLoaded,
      urlPrefix,
    });

    act(() => {
      jest.runAllTimers();
    });

    const internalLink = document.querySelector('a[href="/prefix#internal-section"]');
    expect(internalLink).not.toBeNull();
    expect(internalLink?.textContent).toBe('Link Interno');

    const externalLink = document.querySelector('a[href="https://www.google.com"]');
    expect(externalLink).not.toBeNull();

    const sidebar = document.querySelector('.otnotice-menu');
    expect(sidebar?.getAttribute('style')).toBe('max-height: 65%');
  });
});

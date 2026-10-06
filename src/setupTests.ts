// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

jest.mock('./api/generated/merchants/data-contracts');

const ignoredConsolePatterns = [
  /ReactDOM\.render is no longer supported in React 18/i,
  /An update to .* inside a test was not wrapped in act\(\.\.\.\)/i,
  /react-i18next:: useTranslation: You will need to pass in an i18next instance/i,
  /MUI: The `anchorEl` prop provided to the component is invalid/i,
  /MUI: The GridLegacy component is deprecated/i,
  /MUI: You have provided an out-of-range value/i,
  /date-fns doesn't accept strings as date arguments/i,
  /Error: Not implemented: (navigation|window\.open)/i,
  /validateDOMNesting.*cannot appear as a descendant/i,
  /trans: You need to pass in an i18next instance/i,
  /Warning: Failed prop type/i,
];

const shouldIgnoreConsoleMessage = (...args: Array<unknown>) =>
  args.some((arg) =>
	typeof arg === 'string' && ignoredConsolePatterns.some((pattern) => pattern.test(arg))
  );

const originalConsoleError = console.error.bind(console);
const originalConsoleWarn = console.warn.bind(console);

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation((...args: Array<unknown>) => {
	if (shouldIgnoreConsoleMessage(...args)) {
	  return;
	}

	originalConsoleError(...args);
  });

  jest.spyOn(console, 'warn').mockImplementation((...args: Array<unknown>) => {
	if (shouldIgnoreConsoleMessage(...args)) {
	  return;
	}

	originalConsoleWarn(...args);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});


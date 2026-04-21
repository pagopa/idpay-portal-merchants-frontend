import { DEBUG_CONSOLE } from './constants';

const safeConsole = {
  log: (...args: Array<any>) => console.log(...args),
  debug: (...args: Array<any>) => console.debug(...args),
  info: (...args: Array<any>) => console.info(...args),
  warn: (...args: Array<any>) => console.warn(...args),
  error: (...args: Array<any>) => console.error(...args),
  trace: (...args: Array<any>) => console.trace(...args),
  group: (...args: Array<any>) => (console.group ? console.group(...args) : console.log(...args)),
  groupCollapsed: (...args: Array<any>) =>
    console.groupCollapsed ? console.groupCollapsed(...args) : console.log(...args),
  groupEnd: () => (console.groupEnd ? console.groupEnd() : undefined),
};

export const browserConsole = {
  log: (...args: Array<any>) => (DEBUG_CONSOLE ? safeConsole.log(...args) : undefined),
  debug: (...args: Array<any>) => (DEBUG_CONSOLE ? safeConsole.debug(...args) : undefined),
  info: (...args: Array<any>) => (DEBUG_CONSOLE ? safeConsole.info(...args) : undefined),
  warn: (...args: Array<any>) => (DEBUG_CONSOLE ? safeConsole.warn(...args) : undefined),
  error: (...args: Array<any>) => (DEBUG_CONSOLE ? safeConsole.error(...args) : undefined),
  trace: (...args: Array<any>) => (DEBUG_CONSOLE ? safeConsole.trace(...args) : undefined),
  group: (...args: Array<any>) => (DEBUG_CONSOLE ? safeConsole.group(...args) : undefined),
  groupCollapsed: (...args: Array<any>) =>
    DEBUG_CONSOLE ? safeConsole.groupCollapsed(...args) : undefined,
  groupEnd: () => (DEBUG_CONSOLE ? safeConsole.groupEnd() : undefined),

  /**
   * Utility: execute a logging callback only when DEBUG_CONSOLE is enabled.
   * Useful to avoid expensive JSON.stringify when debug is off.
   */
  whenEnabled: (fn: () => void) => {
    if (!DEBUG_CONSOLE) {
      return;
    }
    fn();
  },

  /**
   * Utility: return a no-op logger when disabled, to keep call-sites simple.
   */
  get enabled() {
    return DEBUG_CONSOLE;
  },
};

export type BrowserConsole = typeof browserConsole;

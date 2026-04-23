/**
 * This test exists to ensure the types module is imported
 * so that it is included in coverage reports.
 *
 * Since this file only contains TypeScript interfaces,
 * there is no runtime logic to test.
 */

import * as Types from '../types';

describe('types.ts', () => {
  it('should be defined', () => {
    expect(Types).toBeDefined();
  });
});

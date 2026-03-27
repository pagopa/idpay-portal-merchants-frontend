// This trivial test ensures coverage for the Jest mock at @standard-schema/utils

import { SchemaError, isStandardSchema, getStandardSchemaMessage } from './utils';

describe('@standard-schema/utils mock', () => {
  it('should instantiate SchemaError', () => {
    const err = new SchemaError([{ code: 'test' }]);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('SchemaError');
    expect(err.issues).toHaveLength(1);
  });

  it('should call isStandardSchema', () => {
    expect(isStandardSchema()).toBe(false);
  });

  it('should call getStandardSchemaMessage', () => {
    expect(getStandardSchemaMessage()).toBeUndefined();
  });
});

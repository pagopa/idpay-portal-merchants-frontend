import { SchemaError, isStandardSchema, getStandardSchemaMessage } from '../utils';

describe('@standard-schema/utils mock', () => {
  describe('SchemaError', () => {
    it('should create a SchemaError with issues', () => {
      const issues = [{ path: ['field'], message: 'Error message' }];
      const error = new SchemaError(issues);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('SchemaError');
      expect(error.message).toBe('Schema validation error');
      expect(error.issues).toEqual(issues);
    });

    it('should handle empty issues array', () => {
      const error = new SchemaError([]);

      expect(error.issues).toEqual([]);
      expect(error.message).toBe('Schema validation error');
    });

    it('should handle multiple issues', () => {
      const issues = [
        { path: ['field1'], message: 'Error 1' },
        { path: ['field2'], message: 'Error 2' },
        { path: ['field3'], message: 'Error 3' },
      ];
      const error = new SchemaError(issues);

      expect(error.issues).toHaveLength(3);
      expect(error.issues).toEqual(issues);
    });

    it('should be throwable as an error', () => {
      const issues = [{ path: ['test'], message: 'Test error' }];

      expect(() => {
        throw new SchemaError(issues);
      }).toThrow('Schema validation error');

      expect(() => {
        throw new SchemaError(issues);
      }).toThrow(SchemaError);
    });

    it('should maintain error stack trace', () => {
      const error = new SchemaError([{ path: ['field'], message: 'Error' }]);

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });
  });

  describe('isStandardSchema', () => {
    it('should return false', () => {
      expect(isStandardSchema()).toBe(false);
    });

    it('should consistently return false', () => {
      expect(isStandardSchema()).toBe(false);
      expect(isStandardSchema()).toBe(false);
      expect(isStandardSchema()).toBe(false);
    });
  });

  describe('getStandardSchemaMessage', () => {
    it('should return undefined', () => {
      expect(getStandardSchemaMessage()).toBeUndefined();
    });

    it('should consistently return undefined', () => {
      expect(getStandardSchemaMessage()).toBeUndefined();
      expect(getStandardSchemaMessage()).toBeUndefined();
      expect(getStandardSchemaMessage()).toBeUndefined();
    });
  });

  describe('Integration tests', () => {
    it('should work together in a validation scenario', () => {
      const isSchema = isStandardSchema();
      const message = getStandardSchemaMessage();

      if (!isSchema) {
        const error = new SchemaError([{ path: ['username'], message: 'Username is required' }]);

        expect(error.name).toBe('SchemaError');
        expect(message).toBeUndefined();
      }
    });

    it('should handle complex validation scenarios', () => {
      const validationErrors = [
        { path: ['email'], message: 'Invalid email format' },
        { path: ['password'], message: 'Password too short' },
        { path: ['age'], message: 'Age must be a number' },
      ];

      const error = new SchemaError(validationErrors);

      expect(error.issues).toHaveLength(3);
      expect(isStandardSchema()).toBe(false);
      expect(getStandardSchemaMessage()).toBeUndefined();
    });
  });
});

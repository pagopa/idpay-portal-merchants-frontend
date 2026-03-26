// Mock for @standard-schema/utils to handle ESM-only package in Jest
class SchemaError extends Error {
  constructor(issues) {
    super('Schema validation error');
    this.name = 'SchemaError';
    this.issues = issues;
  }
}

module.exports = {
  isStandardSchema: () => false,
  getStandardSchemaMessage: () => undefined,
  SchemaError,
};

// Mock for @standard-schema/utils to handle ESM-only package in Jest
export class SchemaError extends Error {
  issues: Array<any>;

  constructor(issues: Array<any>) {
    super('Schema validation error');
    this.name = 'SchemaError';
    this.issues = issues;
  }
}

export const isStandardSchema = (): boolean => false;

export const getStandardSchemaMessage = (): undefined => undefined;

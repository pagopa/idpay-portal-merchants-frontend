import {
  LocaleNamespace,
  initiativeNamespaceGenerator,
  buildScopedNamespaces,
  type InitiativeDescriptor,
} from '../namespaces';

describe('namespaces', () => {
  describe('LocaleNamespace enum', () => {
    it('should expose correct enum values', () => {
      expect(LocaleNamespace.Common).toBe('common');
      expect(LocaleNamespace.DefaultCopy).toBe('default/copy');
      expect(LocaleNamespace.InitiativeCopy).toBe('initiative/copy');
    });
  });

  describe('initiativeNamespaceGenerator', () => {
    it('should return an array of initiative names', () => {
      const initiatives: InitiativeDescriptor[] = [
        { initiativeId: '1', initiativeName: 'initiativeOne' },
        { initiativeId: '2', initiativeName: 'initiativeTwo' },
      ];

      const result = initiativeNamespaceGenerator(initiatives);

      expect(result).toEqual(['initiativeOne', 'initiativeTwo']);
    });

    it('should return an empty array when input is empty', () => {
      const result = initiativeNamespaceGenerator([]);
      expect(result).toEqual([]);
    });
  });

  describe('buildScopedNamespaces', () => {
    it('should build scoped namespaces with initiative name', () => {
      const result = buildScopedNamespaces('myInitiative');

      expect(result).toEqual({
        common: ['common'],
        initiative: ['myInitiative/copy', 'myInitiative/config'],
        default: ['default/copy', 'default/config'],
      });
    });

    it('should return empty initiative namespace if initiativeName is undefined', () => {
      const result = buildScopedNamespaces(undefined);

      expect(result).toEqual({
        common: ['common'],
        initiative: [],
        default: ['default/copy', 'default/config'],
      });
    });

    it('should return empty initiative namespace if initiativeName is empty string', () => {
      const result = buildScopedNamespaces('');

      expect(result).toEqual({
        common: ['common'],
        initiative: [],
        default: ['default/copy', 'default/config'],
      });
    });
  });
});

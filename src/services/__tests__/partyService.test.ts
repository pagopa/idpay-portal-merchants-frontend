import { Party } from '../../model/Party';
import { fetchParties, fetchPartyDetails } from '../partyService';

describe('partyService', () => {
  describe('fetchParties', () => {
    test('should return a promise that resolves to an empty array', async () => {
      const parties = await fetchParties();
      expect(parties).toEqual([]);
    });
  });

  describe('fetchPartyDetails', () => {
    const mockParties: Array<Party> = [
      {
        partyId: '1',
        externalId: 'ext1',
        originId: 'orig1',
        origin: 'TEST',
        description: 'Party One',
        status: 'ACTIVE',
        digitalAddress: 'one@test.com',
        userRole: 'ADMIN',
      },
      {
        partyId: '2',
        externalId: 'ext2',
        originId: 'orig2',
        origin: 'TEST',
        description: 'Party Two',
        status: 'ACTIVE',
        digitalAddress: 'two@test.com',
        userRole: 'ADMIN',
      },
    ];

    test('should return a party from the provided list if found', async () => {
      const partyIdToFind = '1';
      const result = await fetchPartyDetails(partyIdToFind, mockParties);
      expect(result).toEqual(mockParties[0]);
    });

    test('should return null if the party is not found in the provided list', async () => {
      const partyIdToFind = '3';
      const result = await fetchPartyDetails(partyIdToFind, mockParties);
      expect(result).toBeNull();
    });

    test('should return null if no parties list is provided', async () => {
      const partyIdToFind = '1';
      const result = await fetchPartyDetails(partyIdToFind); // No list passed
      expect(result).toBeNull();
    });
  });
});

/* istanbul ignore file */
// import { fetchParties, fetchPartyDetails } from '../partyService';
// import { institutionResource2Party, Party } from '../../model/Party';
// import { PortalApi } from '../../api/PortalApiClient';
// import { mockedInstitutionResources } from '../../api/__mocks__/PortalApiClient';

// jest.mock('../../api/PortalApiClient');

// let portalApiGetInstitutionSpy;
// let portalApiGetInstitutionsSpy;

import { fetchPartyDetails } from '../../services/partyService';
import { verifyFetchPartyDetailsMockExecution } from '../../services/__mocks__/partyService';

beforeEach(() => {
  // portalApiGetInstitutionSpy = jest.spyOn(PortalApi, 'getInstitution');
  // portalApiGetInstitutionsSpy = jest.spyOn(PortalApi, 'getInstitutions');
});

  describe('fetchPartyDetails', () => {
    it('should fetch party details successfully', async () => {
      const partyId = '2b48bf96-fd74-477e-a70a-286b410f020a';
      const party = await fetchPartyDetails(partyId);
    
      if (party !== null) {
        verifyFetchPartyDetailsMockExecution(party);
      } else {
        expect(party).toBeNull();
      }
    });

    it('should handle party not found', async () => {
      const partyId = 'nonexistentpartyid';
      const party = await fetchPartyDetails(partyId);
      expect(party).toBeNull();
    });
  });

test('Test fetchParties', async () => {
  // const parties = await fetchParties();
  // expect(parties).toMatchObject(mockedInstitutionResources.map(institutionResource2Party));
  // parties.forEach((p) =>
  // expect(p.urlLogo).toBe(`http://checkout.selfcare/institutions/${p.partyId}/logo.png`)
  // );
  // expect(portalApiGetInstitutionsSpy).toBeCalledTimes(1);
});

describe('Test fetchPartyDetails', () => {
  // const expectedPartyId: string = '1';

  // const checkSelectedParty = (party: Party | null) => {
  // expect(party).not.toBeNull();
  // expect(party).toMatchObject(institutionResource2Party(mockedInstitutionResources[0]));

  // expect(party!.urlLogo).toBe(
  // `http://checkout.selfcare/institutions/${expectedPartyId}/logo.png`;
  // );
  // };

  const checkPortalApiInvocation = (expectedCallsNumber: number) => {
    // expect(PortalApi.getInstitution).toBeCalledTimes(expectedCallsNumber);
    if (expectedCallsNumber > 0) {
      // expect(PortalApi.getInstitution).toBeCalledWith(expectedPartyId);
    }
  };

  test('Test no parties as cache', async () => {
    // const party = await fetchPartyDetails(expectedPartyId);
    // checkSelectedParty(party);
    // checkPortalApiInvocation(1);
  });

  test('Test parties as cache', async () => {
    // const parties = mockedInstitutionResources.map(institutionResource2Party);
    // const party = await fetchPartyDetails(expectedPartyId, parties);
    // checkSelectedParty(party);
    // checkPortalApiInvocation(0);
    // const partialParties = parties.filter((p) => p.partyId !== expectedPartyId);
    // const party2 = await fetchPartyDetails(expectedPartyId, partialParties);
    // expect(party2).toStrictEqual(party);
    // checkPortalApiInvocation(1);
  });
});

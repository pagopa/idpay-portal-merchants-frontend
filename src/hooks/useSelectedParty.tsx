import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { Party /* PartyRole, UserRole */, PLACEHOLDER_PARTY_LOGO } from '../model/Party';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { partiesActions, partiesSelectors } from '../redux/slices/partiesSlice';
import { fetchPartyDetails } from '../services/partyService';
import { LOADING_TASK_SEARCH_PARTY } from '../utils/constants';
import { parseJwt } from '../utils/jwt-utils';
import { ENV } from '../utils/env';
import { JWTUser } from '../model/JwtUser';

/* export type PartyJwtConfig = {
  partyId: string;
  roles: Array<{
    partyRole: PartyRole;
    roleKey: string;
  }>;
}; */

/* export const retrieveSelectedPartyIdConfig = (): PartyJwtConfig | null => {
  const organization = (parseJwt(storageTokenOps.read()) as JWTUser)?.organization;
  if (
    organization &&
    organization.id &&
    organization.roles &&
    organization.roles.length &&
    organization.roles.length > 0
  ) {
    return {
      partyId: organization.id,
      roles: organization.roles.map((r) => ({
        partyRole: r.partyRole,
        roleKey: r.role,
      })),
    };
  } else {
    return null;
  }
}; */

export type PartyJwtConfig = {
  partyId: string;
  partyName: string;
  partyVat: string;
  roles: Array<{
    partyRole: string;
    roleKey: string;
  }>;
};

export const retrieveSelectedPartyIdConfig = (): PartyJwtConfig | null => {
  const organization = parseJwt(storageTokenOps.read()) as JWTUser;
  if (organization.org_id && organization.org_party_role && organization.org_role) {
    return {
      partyId: organization.org_id,
      partyName: organization.org_name,
      partyVat: organization.org_vat,
      roles: [
        {
          partyRole: organization.org_party_role,
          roleKey: organization.org_role,
        },
      ],
    };
  } else {
    return null;
  }
};

/** A custom hook to read the current partyId from JWT and then fetch it's information, caching the result into redux */
export const useSelectedParty = (): (() => Promise<Party>) => {
  const dispatch = useAppDispatch();
  const partyJwtConfig: PartyJwtConfig | null = retrieveSelectedPartyIdConfig();
  const selectedParty = useAppSelector(partiesSelectors.selectPartySelected);
  const parties = useAppSelector(partiesSelectors.selectPartiesList);
  const setParty = (party?: Party) => dispatch(partiesActions.setPartySelected(party));
  const setLoadingDetails = useLoading(LOADING_TASK_SEARCH_PARTY);

  /* const fetchParty = (partyId: string): Promise<Party> =>
    fetchPartyDetails(partyId, parties).then((party) => {
      if (party) {
        if (party.status !== 'ACTIVE') {
          throw new Error(`INVALID_PARTY_STATE_${party.status}`);
        }
        const partyToSave = {
          ...party,
          roles:
            partyJwtConfig?.roles.map((r) => ({
              partyRole: r.partyRole,
              roleKey: r.roleKey,
            })) ?? [],
        };
        setParty(partyToSave);
        return partyToSave;
      } else {
        throw new Error(`Cannot find partyId ${partyId}`);
      }
    }); */

  const fetchParty = (partyId: string): Promise<Party> =>
    fetchPartyDetails(partyId, parties).then((party) => {
      const partyRoles =
        partyJwtConfig?.roles.map((r) => ({
          partyRole: r.partyRole,
          roleKey: r.roleKey,
        })) ?? [];

      if (party) {
        if (party.status !== 'ACTIVE') {
          throw new Error(`INVALID_PARTY_STATE_${party.status}`);
        }
        const partyToSave = {
          ...party,
          roles: partyRoles,
        };
        setParty(partyToSave);
        return partyToSave;
      } else {
        if (!partyJwtConfig) {
          throw new Error(`Cannot find partyId ${partyId}`);
        }
        trackEvent('PARTY_ID_NOT_FOUND', { partyId });
        const partyToSave: Party = {
          partyId,
          externalId: '',
          originId: '',
          origin: '',
          description: partyJwtConfig.partyName,
          digitalAddress: '',
          status: 'ACTIVE',
          roles: partyRoles,
          urlLogo: PLACEHOLDER_PARTY_LOGO,
          fiscalCode: partyJwtConfig.partyVat,
          registeredOffice: '',
          typology: '',
        };
        setParty(partyToSave);
        return partyToSave;
      }
    });

  return () => {
    if (partyJwtConfig == null) {
      trackEvent('PARTY_ID_NOT_IN_TOKEN');
      window.location.assign(ENV.URL_FE.LOGOUT);
      return new Promise<Party>((_, reject) => reject());
    } else if (!selectedParty || selectedParty.partyId !== partyJwtConfig.partyId) {
      setLoadingDetails(true);

      return fetchParty(partyJwtConfig.partyId)
        .finally(() => setLoadingDetails(false))
        .catch((e) => {
          setParty(undefined);
          throw e;
        });
    } else {
      return new Promise<Party>((resolve) => resolve(selectedParty));
    }
  };
};

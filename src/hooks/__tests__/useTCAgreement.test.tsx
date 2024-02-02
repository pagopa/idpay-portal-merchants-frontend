import React from 'react';
import { RolePermissionApi } from '../../api/rolePermissionApiClient';
import { PortalConsentDTO } from '../../api/generated/role-permission/PortalConsentDTO';
import { renderWithContext } from '../../utils/__tests__/test-utils';
import useTCAgreement from '../useTCAgreement';

jest.mock('../../services/rolePermissionService');

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

const returnVal = {};
const HookWrapper = () => {
  Object.assign(returnVal, useTCAgreement());
  // result = useTCAgreement();
  return null;
};

describe('test suite for usTCAgreement hook', () => {
  test('call of useTCAgreement hook', () => {
    renderWithContext(<HookWrapper />);
  });

  test('mock api call getPortalConsent and render hook useTCAgreement', async () => {
    RolePermissionApi.getPortalConsent = async (): Promise<PortalConsentDTO> =>
      new Promise((resolve) => resolve({ firstAcceptance: true, versionId: 'version123' }));
    renderWithContext(<HookWrapper />);
  });

  test('mock catch case of  api call getPortalConsent and render hook useTCAgreement', async () => {
    RolePermissionApi.getPortalConsent = async (): Promise<PortalConsentDTO> =>
      Promise.reject('mocked error response for tests');
    renderWithContext(<HookWrapper />);
  });
});

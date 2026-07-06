import { BlBadRequestException } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';

import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnExternalLabShareGenerateTokenResponse } from '../cn-external-lab-api/model/cn-external-lab-api.class';
import { CnResourceWithLab } from '../cn-folders-aggregate/cn-resources/cn-resource.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnLabFolderAggregateService } from './cn-lab-folder-aggregate.service';

/**
 * Unit test guarding the space-side invariants for the stable app-link work
 * (docs/app_link_auth_SPACE_BACK.md). getResourceAccess is the single path the
 * space uses to open a shared resource/app in a lab. The design makes the space
 * a pure credential authority: it must (S3) run its permission check BEFORE
 * asking the lab to mint a code, (S1) relay whatever access_url the lab returns
 * unchanged so the lab can swap the resource-open URL for a gateway URL without
 * any space change, and (S4) fetch a fresh code on every open (the lab code is
 * now single-use) — never cache or reuse a previous access_url.
 *
 * These are do-not-regress guards, not new behaviour.
 */
describe('CnLabFolderAggregateService.getResourceAccess', () => {
  const resourceId = 'resource-1';
  const currentUserId = 'user-1';
  const labUser = { id: 'lab-user-1' } as never;
  const glabApiInfo = { url: 'https://lab.example' } as never;

  let service: CnLabFolderAggregateService;
  let resourceAggregateService: { findResource: jest.Mock };
  let labAggregateService: { getUserInfoForLab: jest.Mock };
  let externalLabApiService: { healthCheck: jest.Mock };
  let externalLabShareService: { generateUserAccessToken: jest.Mock };

  /** A resource whose lab is up and exposes the glab api info the service needs. */
  function makeResource(): CnResourceWithLab {
    return {
      token: 'share-token',
      lab: {
        id: 'lab-1',
        name: 'My Lab',
        getGlabSpaceApiInfo: () => glabApiInfo,
      },
    } as unknown as CnResourceWithLab;
  }

  function makeLabResponse(accessUrl: string): CnExternalLabShareGenerateTokenResponse {
    return {
      access_url: accessUrl,
      share_link_valid_until: DateTime.fromISO('2030-01-01T00:00:00Z'),
    } as CnExternalLabShareGenerateTokenResponse;
  }

  beforeEach(() => {
    resourceAggregateService = { findResource: jest.fn() };
    labAggregateService = { getUserInfoForLab: jest.fn().mockResolvedValue(labUser) };
    externalLabApiService = { healthCheck: jest.fn().mockResolvedValue(true) };
    externalLabShareService = { generateUserAccessToken: jest.fn() };

    jest
      .spyOn(CnCurrentUserHelper, 'getAndCheckCurrentUser')
      .mockReturnValue({ id: currentUserId } as CnUser);

    // Only the collaborators getResourceAccess touches are wired; the rest are
    // never called on this path so `null` is safe.
    service = new CnLabFolderAggregateService(
      null as never, // folderAggregateService
      labAggregateService as never,
      null as never, // labFolderService
      null as never, // dataSource
      null as never, // externalLabFolderService
      externalLabApiService as never,
      externalLabShareService as never,
      null as never, // externalLabObjectService
      null as never, // scenarioAggregateService
      null as never, // noteAggregateService
      resourceAggregateService as never
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('relays the lab access_url unchanged (S1: gateway URL passes through)', async () => {
    // A lab gateway URL — the space must not parse, rewrite or validate it.
    const gatewayUrl = 'https://lab.example/gateway?code=abc123';
    resourceAggregateService.findResource.mockResolvedValue(makeResource());
    externalLabShareService.generateUserAccessToken.mockResolvedValue(makeLabResponse(gatewayUrl));

    const access = await service.getResourceAccess(resourceId);

    expect(access.accessUrl).toBe(gatewayUrl);
  });

  it('runs the permission check (findResource) BEFORE asking the lab to mint a code (S3)', async () => {
    const callOrder: string[] = [];
    resourceAggregateService.findResource.mockImplementation(async () => {
      callOrder.push('findResource');
      return makeResource();
    });
    externalLabShareService.generateUserAccessToken.mockImplementation(async () => {
      callOrder.push('generateUserAccessToken');
      return makeLabResponse('https://lab.example/gateway');
    });

    await service.getResourceAccess(resourceId);

    expect(callOrder).toEqual(['findResource', 'generateUserAccessToken']);
  });

  it('never asks the lab to mint a code when the permission check fails (S3)', async () => {
    resourceAggregateService.findResource.mockRejectedValue(new Error('forbidden'));

    await expect(service.getResourceAccess(resourceId)).rejects.toThrow('forbidden');

    expect(externalLabShareService.generateUserAccessToken).not.toHaveBeenCalled();
  });

  it('never asks the lab to mint a code when the lab is not running', async () => {
    resourceAggregateService.findResource.mockResolvedValue(makeResource());
    externalLabApiService.healthCheck.mockResolvedValue(false);

    await expect(service.getResourceAccess(resourceId)).rejects.toThrow(BlBadRequestException);

    expect(externalLabShareService.generateUserAccessToken).not.toHaveBeenCalled();
  });

  it('fetches a fresh code from the lab on every open — no caching (S4: single-use code)', async () => {
    resourceAggregateService.findResource.mockResolvedValue(makeResource());
    externalLabShareService.generateUserAccessToken
      .mockResolvedValueOnce(makeLabResponse('https://lab.example/gateway?code=first'))
      .mockResolvedValueOnce(makeLabResponse('https://lab.example/gateway?code=second'));

    const first = await service.getResourceAccess(resourceId);
    const second = await service.getResourceAccess(resourceId);

    expect(externalLabShareService.generateUserAccessToken).toHaveBeenCalledTimes(2);
    expect(first.accessUrl).not.toBe(second.accessUrl);
  });
});

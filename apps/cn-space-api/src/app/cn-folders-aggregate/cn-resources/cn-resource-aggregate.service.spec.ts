import { CnFoldersSecurityService } from '../cn-security/cn-folders-security.service';
import { CnResourceWithLab } from './cn-resource.entity';
import { CnResourceAggregateService } from './cn-resource-aggregate.service';

/**
 * Unit test guarding S3 of the stable app-link work
 * (docs/app_link_auth_SPACE_BACK.md) at its source: the space owns the
 * "may this user open this app/resource" decision and must run it BEFORE the
 * resource (and therefore its lab) is handed out for code minting.
 * findResource is the single entry point used by getResourceAccess, so the
 * order — security check first, DB fetch second — is the invariant to lock.
 */
describe('CnResourceAggregateService.findResource', () => {
  const resourceId = 'resource-1';
  const resource = { id: resourceId } as unknown as CnResourceWithLab;

  let service: CnResourceAggregateService;
  let resourceService: { findWithLabByIdAndCheck: jest.Mock };
  let securityService: { getAndCheckAuthorizationForFindOne: jest.Mock };

  beforeEach(() => {
    resourceService = { findWithLabByIdAndCheck: jest.fn().mockResolvedValue(resource) };
    securityService = { getAndCheckAuthorizationForFindOne: jest.fn().mockResolvedValue(undefined) };

    service = new CnResourceAggregateService(
      resourceService as never,
      null as never, // hierarchyObjectService
      securityService as unknown as CnFoldersSecurityService,
      null as never, // eventService
      null as never // datasource
    );
  });

  it('runs the permission check before fetching the resource (S3)', async () => {
    const callOrder: string[] = [];
    securityService.getAndCheckAuthorizationForFindOne.mockImplementation(async () => {
      callOrder.push('check');
    });
    resourceService.findWithLabByIdAndCheck.mockImplementation(async () => {
      callOrder.push('find');
      return resource;
    });

    await service.findResource(resourceId);

    expect(securityService.getAndCheckAuthorizationForFindOne).toHaveBeenCalledWith(resourceId);
    expect(callOrder).toEqual(['check', 'find']);
  });

  it('does not fetch the resource when the permission check rejects (S3)', async () => {
    securityService.getAndCheckAuthorizationForFindOne.mockRejectedValue(new Error('forbidden'));

    await expect(service.findResource(resourceId)).rejects.toThrow('forbidden');

    expect(resourceService.findWithLabByIdAndCheck).not.toHaveBeenCalled();
  });
});

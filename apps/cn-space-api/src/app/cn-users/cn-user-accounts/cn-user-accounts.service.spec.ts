import { BlBadRequestException, BlUnauthorizedException, BlUserStatus } from '@monorepo/back-core-lib';
import { Repository } from 'typeorm';

import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnUser, CnUserEntity } from '../cn-user.entity';
import { CnUsersService } from '../cn-users.service';
import { CnUserAccountsService } from './cn-user-accounts.service';

/**
 * Unit test for the admin lock/unlock status transitions. Only the two
 * dependencies these methods touch (the repository and the users service) are
 * mocked, and the current-user admin check is stubbed on the static helper. We
 * assert the state machine: valid transitions + the guards that reject invalid
 * states or non-admin callers.
 */
describe('CnUserAccountsService (lock/unlock)', () => {
  let service: CnUserAccountsService;
  let repository: { save: jest.Mock };
  let usersService: { findByIdAndCheck: jest.Mock };

  beforeEach(() => {
    repository = { save: jest.fn((user) => Promise.resolve(user)) };
    usersService = { findByIdAndCheck: jest.fn() };

    // The service constructor takes many collaborators, but lock/unlock only use
    // the repository, the users service, and the current-user admin check.
    service = new CnUserAccountsService(
      repository as unknown as Repository<CnUser>,
      null as never, // configService
      null as never, // mailService
      usersService as unknown as CnUsersService,
      null as never, // datasource
      null as never, // frontService
      null as never, // spaceAggregateService
      null as never, // groupService
      null as never, // captchaService
      null as never, // supportService
      null as never // eventEmitter
    );
  });

  function makeUser(status: BlUserStatus): CnUser {
    return { id: 'user-1', status } as unknown as CnUserEntity;
  }

  function actAsAdmin(isAdmin: boolean): void {
    jest
      .spyOn(CnCurrentUserHelper, 'getAndCheckCurrentUser')
      .mockReturnValue({ isAdmin: () => isAdmin } as unknown as CnUser);
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('lockUser', () => {
    it('locks a READY user (status -> LOCKED_BY_ADMIN)', async () => {
      actAsAdmin(true);
      usersService.findByIdAndCheck.mockResolvedValue(makeUser(BlUserStatus.READY));

      const result = await service.lockUser('user-1');

      expect(result.status).toBe(BlUserStatus.LOCKED_BY_ADMIN);
      expect(repository.save).toHaveBeenCalled();
    });

    it('throws for a non-admin caller', async () => {
      actAsAdmin(false);
      await expect(service.lockUser('user-1')).rejects.toThrow(BlUnauthorizedException);
      expect(usersService.findByIdAndCheck).not.toHaveBeenCalled();
    });

    it('rejects locking an already-locked user', async () => {
      actAsAdmin(true);
      usersService.findByIdAndCheck.mockResolvedValue(makeUser(BlUserStatus.LOCKED_BY_ADMIN));
      await expect(service.lockUser('user-1')).rejects.toThrow(BlBadRequestException);
    });

    it('rejects locking a not-yet-validated user', async () => {
      actAsAdmin(true);
      usersService.findByIdAndCheck.mockResolvedValue(makeUser(BlUserStatus.WAITING_FOR_EMAIL));
      await expect(service.lockUser('user-1')).rejects.toThrow(BlBadRequestException);
    });
  });

  describe('unlockUser', () => {
    it('unlocks a LOCKED_BY_ADMIN user (status -> READY)', async () => {
      actAsAdmin(true);
      usersService.findByIdAndCheck.mockResolvedValue(makeUser(BlUserStatus.LOCKED_BY_ADMIN));

      const result = await service.unlockUser('user-1');

      expect(result.status).toBe(BlUserStatus.READY);
      expect(repository.save).toHaveBeenCalled();
    });

    it('throws for a non-admin caller', async () => {
      actAsAdmin(false);
      await expect(service.unlockUser('user-1')).rejects.toThrow(BlUnauthorizedException);
    });

    it('rejects unlocking a user that is not locked', async () => {
      actAsAdmin(true);
      usersService.findByIdAndCheck.mockResolvedValue(makeUser(BlUserStatus.READY));
      await expect(service.unlockUser('user-1')).rejects.toThrow(BlBadRequestException);
    });
  });
});

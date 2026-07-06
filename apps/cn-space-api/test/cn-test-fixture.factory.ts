// IMPORTANT: load CnAppModule first. The app entities form a circular graph
// (cn-base <- cn.entity <- cn-user <- cn-space <- cn-bucket <- cloud-provider-region
// which extends cn-base). Importing an individual entity (e.g. CnCloudProvider)
// as the very first app import evaluates that cycle in the wrong order and throws
// "Class extends value undefined". CnAppModule pulls the whole graph in the
// resolved order the app uses, so every subsequent entity import is safe.
// eslint-disable-next-line @typescript-eslint/no-unused-vars, import/order
import '../src/cn-app.module';

import { BlBucketType, BlUserCategory, BlUserStatus } from '@monorepo/back-core-lib';
import * as argon2 from 'argon2';
import { DataSource } from 'typeorm';

import { CnCity } from '../src/app/cn-city/cn-city.entity';
import { CnCloudProvider } from '../src/app/cn-cloud-providers/cn-cloud-provider.entity';
import {
  CnCloudProviderRegion,
  CnCloudProviderRegionType,
} from '../src/app/cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnCountry } from '../src/app/cn-country/cn-country.entity';
import { CnCurrentUserHelper } from '../src/app/cn-core/utils/cn-current-user.helper';
import { CnBucket, CnBucketContentType } from '../src/app/cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnBucketCredentials } from '../src/app/cn-object-storages/cn-bucket-credential/cn-bucket-credential.entity';
import { CnSpace, CnSpaceEntity, CnSpaceType } from '../src/app/cn-spaces/cn-space.entity';
import { CnSpaceUserEntity, CnSpaceUserRole } from '../src/app/cn-spaces/cn-space-user.entity';
import { CnUser, CnUserEntity, CnUserLicense } from '../src/app/cn-users/cn-user.entity';
import { TEST_ADMIN_ID } from './test-credentials';

/**
 * Second (non-admin) test user. Every 403 / permission assertion needs a user
 * who is NOT a global admin and NOT a member of the space under test. The
 * password is known so E2E can log in as this user (see
 * CnTestE2EHelper.loginAsSecondUser).
 */
export const TEST_USER_ID = '2b2f0b8c-0000-4000-8000-000000000002';
export const TEST_USER_EMAIL = 'user.member@gencovery.com';
export const TEST_USER_PASSWORD = 'test-password-2';

/**
 * The set of fixtures created by the factory, returned so suites can reference
 * ids / the space domain without re-querying.
 */
export interface CnTestFixtures {
  /** A non-admin user, enterprise-licensed, NOT a member of `enterpriseSpace`. */
  secondUser: CnUser;
  /** An enterprise space owned (ADMIN role) by the seeded admin user. */
  enterpriseSpace: CnSpace;
  /**
   * The `domain` of `enterpriseSpace`. Set it as the `local-space` cookie on a
   * request to make it the "current space" (see the E2E guard behaviour).
   */
  enterpriseSpaceDomain: string;
  /** A FOLDER bucket usable as a space's default storage location. */
  folderBucket: CnBucket;
}

/**
 * Creates the shared fixtures used by the Phase 1 E2E suites, going straight
 * through the TypeORM repositories (schema-proof, no raw SQL) rather than the
 * cloud-dependent signup/space-creation endpoints.
 *
 * Why not the real endpoints? Creating a space/user through the app fetches
 * default buckets from a real cloud region lookup and provisions personal
 * spaces — heavy, external-dependency work we don't want in a regression suite.
 * The factory inserts a self-consistent object graph
 * (country -> city -> provider -> region -> credentials -> bucket -> space ->
 * membership) so space-scoped workflows behave exactly as in production.
 *
 * Must run AFTER the admin user is seeded (CnTestDbInitializerService.initDb),
 * because several rows extend CnBaseEntity and stamp `createdBy` with the
 * current user — provided here via the robot-user mechanism.
 */
export class CnTestFixtureFactory {
  constructor(private datasource: DataSource) {}

  public async create(): Promise<CnTestFixtures> {
    // CnBaseEntity.@BeforeInsert stamps createdBy from the current user. There
    // is no request context during seeding, so expose the admin as the robot
    // user (CnCurrentUserHelper falls back to it when no request is present).
    const admin = await this.datasource.getRepository(CnUserEntity).findOneByOrFail({ id: TEST_ADMIN_ID });
    CnCurrentUserHelper.setRobotUser(admin);
    try {
      const folderBucket = await this.createFolderBucket();
      const enterpriseSpace = await this.createEnterpriseSpace(admin, folderBucket);
      const secondUser = await this.createSecondUser();

      return {
        secondUser,
        enterpriseSpace,
        enterpriseSpaceDomain: enterpriseSpace.domain,
        folderBucket,
      };
    } finally {
      // don't leak the robot user into the request-scoped app under test
      CnCurrentUserHelper.setRobotUser(null);
    }
  }

  /**
   * Build the country -> city -> provider -> region -> credentials -> bucket
   * chain and return a FOLDER bucket. bucketType NORMAL keeps it a plain S3
   * (cloud) bucket, so only the `region` relation must be loaded to be valid.
   */
  private async createFolderBucket(): Promise<CnBucket> {
    const country = await this.datasource.getRepository(CnCountry).save(
      Object.assign(new CnCountry(), { name: 'France', shortName: 'FR' })
    );

    const city = await this.datasource
      .getRepository(CnCity)
      .save(Object.assign(new CnCity(), { name: 'Gravelines', country }));

    const provider = await this.datasource
      .getRepository(CnCloudProvider)
      .save(Object.assign(new CnCloudProvider(), { name: 'OVH' as const }));

    const region = await this.datasource.getRepository(CnCloudProviderRegion).save(
      Object.assign(new CnCloudProviderRegion(), {
        cloudProvider: provider,
        city,
        type: CnCloudProviderRegionType.S3,
        technicalName: 'gra',
        name: 'Gravelines (test)',
        s3Endpoint: 'https://s3.gra.example.test',
      })
    );

    const credentials = await this.datasource.getRepository(CnBucketCredentials).save(
      Object.assign(new CnBucketCredentials(), {
        name: 'test-credentials',
        cloudProvider: provider,
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
      })
    );

    return this.datasource.getRepository(CnBucket).save(
      Object.assign(new CnBucket(), {
        name: 'test-folder-bucket',
        contentType: CnBucketContentType.FOLDER,
        bucketType: BlBucketType.NORMAL,
        region,
        credentials,
      })
    );
  }

  /**
   * Create an ENTERPRISE space and add the admin as its ADMIN member, mirroring
   * what CnSpaceAggregateService.createEntrepriseSpace does (space + membership)
   * without the storage/cloud checks.
   */
  private async createEnterpriseSpace(admin: CnUser, folderBucket: CnBucket): Promise<CnSpace> {
    const space = await this.datasource.getRepository(CnSpaceEntity).save(
      Object.assign(new CnSpaceEntity(), {
        name: 'Test Enterprise Space',
        type: CnSpaceType.ENTREPRISE,
        defaultFolderBucket: folderBucket,
        createdBy: admin,
        lastModifiedBy: admin,
      })
    );

    await this.addMembership(space, admin, CnSpaceUserRole.ADMIN, admin);

    return space;
  }

  /**
   * Seed a second non-admin user with a known password so E2E can log in as a
   * non-admin. Enterprise-licensed so it can be added to an enterprise space.
   */
  private async createSecondUser(): Promise<CnUser> {
    const passwordHash = await argon2.hash(TEST_USER_PASSWORD);

    return this.datasource.getRepository(CnUserEntity).save(
      Object.assign(new CnUserEntity(), {
        id: TEST_USER_ID,
        firstname: 'Member',
        lastname: 'User',
        email: TEST_USER_EMAIL,
        password: passwordHash,
        category: BlUserCategory.USER,
        status: BlUserStatus.READY,
        license: CnUserLicense.ENTERPRISE,
      })
    );
  }

  /** Add a membership row (space_user) directly, matching the entity shape. */
  public async addMembership(
    space: CnSpace,
    user: CnUser,
    role: CnSpaceUserRole,
    addedBy: CnUser
  ): Promise<CnSpaceUserEntity> {
    return this.datasource.getRepository(CnSpaceUserEntity).save(
      Object.assign(new CnSpaceUserEntity(), {
        user,
        space,
        role,
        active: true,
        addedBy,
      })
    );
  }
}

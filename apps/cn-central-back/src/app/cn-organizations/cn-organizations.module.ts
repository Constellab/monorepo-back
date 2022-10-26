import {Module} from '@nestjs/common';
import {CnOrganizationsController} from './cn-organizations.controller';
import {CnOrganizationsService} from './cn-organizations.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnOrganization} from './cn-organization.entity';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnOrganizationAggregateService} from './cn-organization-aggregate.service';
import {CnOrganizationAggregateSecurity} from './cn-organization-aggregate.security';
import {CnOrganizationUserService} from './cn-organization-user.service';
import {CnOrganizationUser} from './cn-organization-user.entity';
import {CnOrganizationInvit} from './cn-organization-invit.entity';
import {CnOrganizationInvitController} from './cn-organization-invit.controller';
import {CnOrganizationInvitService} from './cn-organization-invit.service';
import {CnCoreModule} from '../cn-core/cn-core.module';

/**
 * Module to manage organization
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CnOrganization, CnOrganizationUser, CnOrganizationInvit]),
    CnUsersModule,
    CnCoreModule,
  ],
  controllers: [CnOrganizationsController, CnOrganizationInvitController],
  providers: [
    CnOrganizationsService,
    CnOrganizationAggregateService,
    CnOrganizationAggregateSecurity,
    CnOrganizationUserService,
    CnOrganizationInvitService,
  ],
  exports: [
    CnOrganizationsService,
    CnOrganizationUserService,
  ]
})
export class CnOrganizationsModule {
}

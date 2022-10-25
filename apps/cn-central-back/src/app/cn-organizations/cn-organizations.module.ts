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
import {CnCoreConfigModule} from '../cn-core/modules/cn-core-config/cn-core-config.module';

/**
 * Module to manage organization
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CnOrganization]),
    TypeOrmModule.forFeature([CnOrganizationUser]),
    CnUsersModule,
    CnCoreConfigModule,
  ],
  controllers: [CnOrganizationsController],
  providers: [
    CnOrganizationsService,
    CnOrganizationAggregateService,
    CnOrganizationAggregateSecurity,
    CnOrganizationUserService,
  ],
  exports: [
    CnOrganizationsService,
    CnOrganizationUserService,
  ]
})
export class CnOrganizationsModule {
}

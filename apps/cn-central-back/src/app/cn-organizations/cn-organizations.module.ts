import {Module} from '@nestjs/common';
import {CnOrganizationsController} from './cn-organizations.controller';
import {CnOrganizationsService} from './cn-organizations.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnOrganization} from './cn-organization.entity';
import {CnOrganizationSecurityLayer} from './cn-organization-security.layer';
import {CnGroupsModule} from '../cn-groups/cn-groups.module';

/**
 * Module to manage organization
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CnOrganization]),

    CnGroupsModule,
  ],
  controllers: [CnOrganizationsController],
  providers: [CnOrganizationsService, CnOrganizationSecurityLayer]
})
export class CnOrganizationsModule {
}

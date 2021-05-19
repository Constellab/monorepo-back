import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Organization} from './organization.entity';
import {OrganizationSecurityLayer} from './organization-security.layer';

/**
 * Module to manage organization
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Organization])
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationSecurityLayer]
})
export class OrganizationsModule {}

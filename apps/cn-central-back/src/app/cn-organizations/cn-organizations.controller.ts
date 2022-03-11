import {Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Put, Query} from '@nestjs/common';
import {CnOrganization} from './cn-organization.entity';
import {CnAbstractSecureController} from '../cn-core/class/cn-abstract-secure.controller';
import {CnOrganizationSecurityLayer} from './cn-organization-security.layer';
import {CnUser} from '../cn-users/cn-user.entity';
import {ClPage} from '@monorepo/core-lib';

@Controller('organizations')
export class CnOrganizationsController extends CnAbstractSecureController<CnOrganization> {

  constructor(private securityLayer: CnOrganizationSecurityLayer) {
    super(securityLayer, CnOrganization);
  }

  @Get('')
  public async getAll(@Query('page', new ParseIntPipe()) page: number,
                      @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnOrganization>> {
    return this.securityLayer.getAll(page, size);
  }

  @Put(':id/add-user/:userId')
  public async addUserToOrganization(@Param('id', new ParseUUIDPipe()) id: string,
                                     @Param('userId', new ParseUUIDPipe()) userId: string): Promise<CnUser> {
    return this.securityLayer.addUserToOrganization(id, userId);
  }

  @Delete(':id/remove-user/:userId')
  public async removeUserFromOrganization(@Param('id', new ParseUUIDPipe()) id: string,
                                          @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.securityLayer.removeUserFromOrganization(id, userId);
  }

  @Get(':id/users')
  public async getUserOfOrganization(@Param('id', new ParseUUIDPipe()) id: string,
                                     @Query('page', new ParseIntPipe()) page: number,
                                     @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnUser>> {
    return this.securityLayer.getUsersOfOrganization(id, page, size);
  }
}

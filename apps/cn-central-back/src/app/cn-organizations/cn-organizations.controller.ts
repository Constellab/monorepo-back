import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import {CnOrganization} from './cn-organization.entity';
import {ClPage} from '@monorepo/core-lib';
import {CnOrganizationAggregateService} from './cn-organization-aggregate.service';
import {BlFile, BlParsePipe, BlPublic, BlResponseHelper} from '@monorepo/back-core-lib';
import {CnOrganizationUser, CnOrganizationUserRole} from './cn-organization-user.entity';
import {FileInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {CnUserCategories} from '../cn-core/decorators/cn-user-category.decorator';
import {CmUserCategory} from '@monorepo/common-model';
import {CnOrganizationInvit} from './cn-organization-invit.entity';
import {CnUserOrgaInfo} from '../cn-users/cn-user.dto';
import {CnRequestNewLicensesDto} from './cn-organization.dto';

@Controller('organizations')
export class CnOrganizationsController {

  constructor(private organizationAggregate: CnOrganizationAggregateService) {
  }

  @Get('current-info')
  async getCurrentInfo(): Promise<CnUserOrgaInfo> {
    return this.organizationAggregate.getCurrentInfo();
  }


  @Get('default')
  getDefault(): Promise<CnOrganization> {
    return this.organizationAggregate.getDefaultOrganization();
  }

  @Get('current')
  findCurrent(): Promise<CnOrganization> {
    return this.organizationAggregate.findCurrentOrganization();
  }

  @Get('my-organizations')
  findCurrentUserOrganizations(): Promise<CnOrganization[]> {
    return this.organizationAggregate.findCurrentUserOrganizations();
  }


  @Post()
  create(@Body(new BlParsePipe(CnOrganization)) entity: CnOrganization): Promise<CnOrganization> {
    return this.organizationAggregate.create(entity);
  }

  @Put()
  update(@Body(new BlParsePipe(CnOrganization)) entity: CnOrganization): Promise<CnOrganization> {
    return this.organizationAggregate.update(entity);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.organizationAggregate.delete(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CnOrganization> {
    return this.organizationAggregate.findOne(id);
  }

  @Get('')
  public async getAll(@Query('page', new ParseIntPipe()) page: number,
                      @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnOrganization>> {
    return this.organizationAggregate.getAll(page, size);
  }

  @CnUserCategories(CmUserCategory.ADMIN)
  @Post(':id/user/:userId')
  public async addUserToOrganization(@Param('id') id: string,
                                     @Param('userId', new ParseUUIDPipe()) userId: string)
    : Promise<CnOrganizationUser> {
    return this.organizationAggregate.addUserToOrganization(id, userId);
  }

  @Delete(':id/user/:userId')
  public async removeUserFromOrganization(@Param('id') id: string,
                                          @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.organizationAggregate.removeUserFromOrganization(id, userId);
  }

  @Put(':id/user/:userId/activate')
  public async activateUser(@Param('id') id: string,
                            @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.organizationAggregate.activateUserInOrganization(id, userId);
  }

  @Put(':id/user/:userId/deactivate')
  public async deactivateUser(@Param('id') id: string,
                              @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.organizationAggregate.deactivateUserInOrganization(id, userId);
  }

  @Put(':id/user/:userId/role/:role')
  public async updateUserRole(@Param('id') id: string,
                              @Param('userId', new ParseUUIDPipe()) userId: string,
                              @Param('role', new ParseEnumPipe(CnOrganizationUserRole)) role: CnOrganizationUserRole): Promise<void> {
    return this.organizationAggregate.updateUserRoleInOrganization(id, userId, role);
  }

  @Get(':id/user')
  public async getUserOfOrganization(@Param('id') id: string,
                                     @Query('page', new ParseIntPipe()) page: number,
                                     @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnOrganizationUser>> {
    return this.organizationAggregate.getUsersOfOrganization(id, page, size);
  }

  @Get(':id/invitations')
  public async getInvitationsByOrganization(@Param('id') id: string,
                                            @Query('page', new ParseIntPipe()) page: number,
                                            @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnOrganizationInvit>> {
    return this.organizationAggregate.getNotificationsByOrganization(id, page, size);
  }

  @UseInterceptors(FileInterceptor('photo'))
  @Put(':id/photo')
  async uploadOrganizationPhoto(@Param('id') id: string,
                                @UploadedFile() file: BlFile): Promise<CnOrganization> {
    return this.organizationAggregate.uploadOrganizationPhoto(id, file);
  }

  /**
   * Return an image of an organization
   */
  @BlPublic()
  @Get('photo/:filename')
  public async getImage(@Param('filename') filename: string,
                        @Res() response: Response): Promise<any> {
    const file = await this.organizationAggregate.getPhoto(filename);
    BlResponseHelper.setMessageAndCache(response, file);
  }

  ////////////////////////////////////// OTHERS //////////////////////////////////////
  @Post(':id/request-new-licenses')
  public async requestNewLicences(@Param('id') id: string,
                                  @Body() request: CnRequestNewLicensesDto): Promise<void> {
    return this.organizationAggregate.requestNewLicenses(id, request);
  }
}

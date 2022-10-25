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
import {BlFile, BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {CnOrganizationUser, CnOrganizationUserRole} from './cn-organization-user.entity';
import {FileInterceptor, FilesInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';

@Controller('organizations')
export class CnOrganizationsController {

  constructor(private organizationAggregate: CnOrganizationAggregateService) {
  }


  //////////////////////////////// CURRENT ORGA ROUTES ////////////////////////////////
  @Get('default')
  getDefault(): Promise<CnOrganization> {
    return this.organizationAggregate.getDefaultOrganization();
  }

  @Get('current')
  findCurrent(): Promise<CnOrganization> {
    return this.organizationAggregate.findCurrentOrganization();
  }

  @Put('current/user/:userId')
  public async addUserToCurrentOrganization(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<CnOrganizationUser> {
    return this.organizationAggregate.addUserToCurentOrganization(userId);
  }

  @Delete('current/user/:userId')
  public async removeUserFromCurrentOrganization(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.organizationAggregate.removeUserFromCurrentOrganization(userId);
  }

  @Put('current/user/:userId/activate')
  public async activateUserInCurrentOrganization(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.organizationAggregate.activateUserInCurrentOrganization(userId);
  }

  @Put('current/user/:userId/deactivate')
  public async deactivateUserInCurrentOrganization(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.organizationAggregate.deactivateUserInCurrentOrganization(userId);
  }

  @Put('current/user/:userId/role/:role')
  public async updateUserRoleInCurrentOrganization(@Param('userId', new ParseUUIDPipe()) userId: string,
                                                   @Param('role',
                                                     new ParseEnumPipe(CnOrganizationUserRole)) role: CnOrganizationUserRole)
    : Promise<void> {
    return this.organizationAggregate.updateUserRoleInCurrentOrganization(userId, role);
  }

  @Get('current/user')
  public async getUserOfCurrentOrganization(@Query('page', new ParseIntPipe()) page: number,
                                            @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnOrganizationUser>> {
    return this.organizationAggregate.getUserOfCurrentOrganization(page, size);
  }

  @UseInterceptors(FilesInterceptor('photo'))
  @Put('current/photo')
  async uploadCurrentOrganizationPhoto(@UploadedFile() file: BlFile): Promise<CnOrganization> {
    return this.organizationAggregate.uploadCurrentOrganizationPhoto(file);
  }


  //////////////////////////////// G ADMIN ROUTES ////////////////////////////////


  @Post()
  create(@Body(new BlParsePipe(CnOrganization)) entity: CnOrganization): Promise<CnOrganization> {
    return this.organizationAggregate.create(entity);
  }

  @Put()
  update(@Body(new BlParsePipe(CnOrganization)) entity: CnOrganization): Promise<CnOrganization> {
    return this.organizationAggregate.update(entity);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.organizationAggregate.delete(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CnOrganization> {
    return this.organizationAggregate.findOne(id);
  }

  @Get('')
  public async getAll(@Query('page', new ParseIntPipe()) page: number,
                      @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnOrganization>> {
    return this.organizationAggregate.getAll(page, size);
  }

  @Put(':id/user/:userId')
  public async addUserToOrganization(@Param('id', new ParseUUIDPipe()) id: string,
                                     @Param('userId', new ParseUUIDPipe()) userId: string): Promise<CnOrganizationUser> {
    return this.organizationAggregate.addUserToOrganization(id, userId);
  }

  @Delete(':id/user/:userId')
  public async removeUserFromOrganization(@Param('id', new ParseUUIDPipe()) id: string,
                                          @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.organizationAggregate.removeUserFromOrganization(id, userId);
  }

  @Put(':id/user/:userId/activate')
  public async activateUser(@Param('id', new ParseUUIDPipe()) id: string,
                            @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.organizationAggregate.activateUserInOrganization(id, userId);
  }

  @Put(':id/user/:userId/deactivate')
  public async deactivateUser(@Param('id', new ParseUUIDPipe()) id: string,
                              @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.organizationAggregate.deactivateUserInOrganization(id, userId);
  }

  @Put(':id/user/:userId/role/:role')
  public async updateUserRole(@Param('id', new ParseUUIDPipe()) id: string,
                              @Param('userId', new ParseUUIDPipe()) userId: string,
                              @Param('role', new ParseEnumPipe(CnOrganizationUserRole)) role: CnOrganizationUserRole): Promise<void> {
    return this.organizationAggregate.updateUserRoleInOrganization(id, userId, role);
  }

  @Get(':id/user')
  public async getUserOfOrganization(@Param('id', new ParseUUIDPipe()) id: string,
                                     @Query('page', new ParseIntPipe()) page: number,
                                     @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnOrganizationUser>> {
    return this.organizationAggregate.getUsersOfOrganization(id, page, size);
  }

  @UseInterceptors(FileInterceptor('photo'))
  @Put(':id/photo')
  async uploadOrganizationPhoto(@Param('id', new ParseUUIDPipe()) id: string,
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
    file.pipe(response);
  }

}

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
  UseInterceptors
} from '@nestjs/common';
import {CnSpace} from './cn-space.entity';
import {ClPage} from '@monorepo/core-lib';
import {CnSpaceAggregateService} from './cn-space-aggregate.service';
import {
  BlFile,
  BlParsePipe,
  BlPublic,
  BlResponseHelper,
  BlSearchParams,
  BlUploadedFile,
  BlUserCategory
} from '@monorepo/back-core-lib';
import {CnSpaceUser, CnSpaceUserRole} from './cn-space-user.entity';
import {FileInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {CnUserCategories} from '../cn-core/decorators/cn-user-category.decorator';
import {CnUserSpaceInfo} from '../cn-users/cn-user.dto';
import {CnRequestNewLicensesDto, CnSaveSpaceDTO, CnSpaceSettingsDto} from './cn-space.dto';
import {CnUser} from '../cn-users/cn-user.entity';

@Controller('spaces')
export class CnSpacesController {

  constructor(private spaceAggregateService: CnSpaceAggregateService) {
  }

  @Get('current-info')
  async getCurrentInfo(): Promise<CnUserSpaceInfo> {
    return this.spaceAggregateService.getCurrentInfo();
  }

  @Get('current-space/settings')
  async getCurrentSpaceSettings(): Promise<CnSpaceSettingsDto> {
    return this.spaceAggregateService.getCurrentSpaceSettings();
  }

  @Get('my-spaces')
  findCurrentUserSpaces(): Promise<CnSpace[]> {
    return this.spaceAggregateService.findCurrentUserSpaces();
  }

  @Get('user/:userId')
  public async getSpacesOfUser(@Param('userId') userId: string): Promise<CnSpace[]> {
    return this.spaceAggregateService.getSpacesOfUser(userId);
  }


  @Post()
  create(@Body(new BlParsePipe(CnSaveSpaceDTO)) entity: CnSaveSpaceDTO): Promise<CnSpaceSettingsDto> {
    return this.spaceAggregateService.createBasicSpace(entity);
  }

  @Put()
  update(@Body(new BlParsePipe(CnSaveSpaceDTO)) entity: CnSaveSpaceDTO): Promise<CnSpaceSettingsDto> {
    return this.spaceAggregateService.update(entity);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.spaceAggregateService.delete(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CnSpace> {
    return this.spaceAggregateService.findOne(id);
  }

  @Get('')
  public async getAll(@Query('page', new ParseIntPipe()) page: number,
                      @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnSpace>> {
    return this.spaceAggregateService.getAll(page, size);
  }

  @Post('search')
  public async search(@Body(new BlParsePipe(BlSearchParams)) searchParams: BlSearchParams,
                      @Query('page', new ParseIntPipe()) page: number,
                      @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnSpace>> {
    return this.spaceAggregateService.search(searchParams, page, size);
  }

  @Get('search/name/:name')
  public async searchByName(@Param('name') name: string,
                            @Query('page', new ParseIntPipe()) page: number,
                            @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnSpace>> {
    return this.spaceAggregateService.searchByName(name, page, size);
  }

  @UseInterceptors(FileInterceptor('photo'))
  @Put(':id/photo')
  async uploadSpacePhoto(@Param('id') id: string,
                         @BlUploadedFile() file: BlFile): Promise<CnSpace> {
    return this.spaceAggregateService.uploadSpacePhoto(id, file);
  }

  /**
   * Return the image of a space
   */
  @BlPublic()
  @Get('photo/:filename')
  public async getImage(@Param('filename') filename: string,
                        @Res() response: Response): Promise<any> {
    const file = await this.spaceAggregateService.getPhoto(filename);
    BlResponseHelper.setMessageAndCache(response, file);
  }

  //////////////////////////////////////// USER ////////////////////////////////////////

  @Post(':id/user/search')
  public async searchUserInSpace(@Param('id') id: string,
                                 @Body(new BlParsePipe(BlSearchParams)) searchParams: BlSearchParams,
                                 @Query('page', new ParseIntPipe()) page: number,
                                 @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnSpaceUser>> {
    return this.spaceAggregateService.searchUserInSpace(id, searchParams, page, size);
  }

  @Get(':id/user/search/name/:name')
  public async searchUserByNameInSpace(@Param('id') id: string,
                                       @Param('name') name: string,
                                       @Query('page', new ParseIntPipe()) page: number,
                                       @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnUser>> {
    return this.spaceAggregateService.searchUserInSpaceByName(id, name, page, size);
  }


  @CnUserCategories(BlUserCategory.ADMIN)
  @Post(':id/user/:userId')
  public async addUserToSpace(@Param('id') id: string,
                              @Param('userId', new ParseUUIDPipe()) userId: string): Promise<CnSpaceUser> {
    return this.spaceAggregateService.addUserToSpace(id, userId);
  }

  @Delete(':id/user/:userId')
  public async removeUserFromSpace(@Param('id') id: string,
                                   @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.spaceAggregateService.removeUserFromSpace(id, userId);
  }

  @Put(':id/user/:userId/activate')
  public async activateUser(@Param('id') id: string,
                            @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.spaceAggregateService.activateUserInSpace(id, userId);
  }

  @Put(':id/user/:userId/deactivate')
  public async deactivateUser(@Param('id') id: string,
                              @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.spaceAggregateService.deactivateUserInSpace(id, userId);
  }

  @Put(':id/user/:userId/role/:role')
  public async updateUserRole(@Param('id') id: string,
                              @Param('userId', new ParseUUIDPipe()) userId: string,
                              @Param('role', new ParseEnumPipe(CnSpaceUserRole)) role: CnSpaceUserRole): Promise<void> {
    return this.spaceAggregateService.updateUserRoleInSpace(id, userId, role);
  }

  @Get(':id/user')
  public async getUsersOfSpace(@Param('id') id: string,
                               @Query('page', new ParseIntPipe()) page: number,
                               @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnSpaceUser>> {
    return this.spaceAggregateService.getUsersOfSpace(id, page, size);
  }

  @Get(':id/user-simple')
  public async getUsersOfSpaceSimple(@Param('id') id: string,
                                     @Query('page', new ParseIntPipe()) page: number,
                                     @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<CnUser>> {
    const spaceUsers = await this.spaceAggregateService.getUsersOfSpace(id, page, size);
    return spaceUsers.map(spaceUser => spaceUser.user);
  }


  ////////////////////////////////////// SPACE USER QUEUE //////////////////////////////////////
  @Put('send-all-space-user-to-queue')
  public async sendAllSpaceUsersToQueue(): Promise<void> {
    return this.spaceAggregateService.sendAllSpaceUsersToQueue();
  }

  @Put('send-all-space-user-to-queue/:spaceId')
  public async sendAllSpaceUsersFromASpaceToQueue(
    @Param('spaceId') spaceId: string
  ): Promise<void> {
    return this.spaceAggregateService.sendAllSpaceUsersFromASpaceToQueue(spaceId);
  }


  ////////////////////////////////////// OTHERS //////////////////////////////////////


  @Post(':id/request-new-licenses')
  public async requestNewLicences(@Param('id') id: string,
                                  @Body() request: CnRequestNewLicensesDto): Promise<void> {
    return this.spaceAggregateService.requestNewLicenses(id, request);
  }

  // get user from a normal user,
  // this is not the best location for this route
  @Get('find-user/:userId')
  public async getAndCheckUser(@Param('userId') userId: string): Promise<CnUser> {
    return this.spaceAggregateService.getAndCheckUser(userId);
  }


  @Post('generate-all-user-personal-space')
  public async generateAllUserPersonalSpace(): Promise<void> {
    return this.spaceAggregateService.generateAllUserPersonalSpace();
  }
}

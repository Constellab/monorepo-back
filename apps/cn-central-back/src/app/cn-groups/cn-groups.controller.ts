import {Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put} from '@nestjs/common';
import {CnGroupsService} from './cn-groups.service';
import {CnGroup} from './cn-group.entity';

@Controller('groups')
export class CnGroupsController {

  constructor(private service: CnGroupsService) {
  }

  @Get('current')
  public getCurrentGroups(): Promise<CnGroup[]> {
    return this.service.getCurrentUserGroups();
  }

  @Post(':label')
  public createGroup(@Param('label') label: string): Promise<CnGroup> {
    return this.service.createGroupUsers(label);
  }

  @Put(':id/label/:label')
  public updateLabel(@Param('id', new ParseUUIDPipe()) id: string,
                     @Param('label') label: string): Promise<CnGroup> {
    return this.service.updateGroupLabel(id, label);
  }

  @Post(':id/add-user/:userId')
  public addUserToGroup(@Param('id', new ParseUUIDPipe()) id: string,
                        @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.service.addUserToGroup(userId, id);
  }

  @Delete(':id/remove-user/:userId')
  public removeUser(@Param('id', new ParseUUIDPipe()) id: string,
                    @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    return this.service.removeUserFromGroup(userId, id);
  }

}

import {Body, Controller, Delete, Get, Param, ParseEnumPipe, ParseUUIDPipe, Post, Put} from '@nestjs/common';
import {CnSpaceAggregateService} from './cn-space-aggregate.service';
import {CnSpaceInvitDto} from './cn-space.dto';
import {CnSpaceInvit} from './cn-space-invit.entity';
import {CnSpaceUserRole} from './cn-space-user.entity';
import {BlPublic} from '@monorepo/back-core-lib';
import {CnUser} from '../cn-users/cn-user.entity';

@Controller('space-invit')
export class CnSpaceInvitController {

  constructor(private spaceAggregateService: CnSpaceAggregateService) {
  }

  //////////////////////////////// INVITATION ROUTES ////////////////////////////////


  @BlPublic()
  @Get('code/:code')
  public async getInvitationByCode(@Param('code') code: string): Promise<CnSpaceInvit> {
    return this.spaceAggregateService.getInvitationByCode(code);
  }


  @Post('code/:code/accept')
  public async acceptInvitationExistingUser(@Param('code') code: string): Promise<CnUser> {
    return this.spaceAggregateService.existingUserAcceptsInvitation(code);
  }

  @Post(':spaceId')
  public async createInvitation(@Param('spaceId') id: string,
                                @Body() invitDto: CnSpaceInvitDto): Promise<CnSpaceInvit> {
    return this.spaceAggregateService.inviteUserToSpace(id, invitDto);
  }

  @Put(':id/resend')
  public async resendInvitation(@Param('id', new ParseUUIDPipe()) invitId: string): Promise<void> {
    return this.spaceAggregateService.resendInvitation(invitId);
  }

  @Put(':id/refresh-validity')
  public async refreshInvitationValidity(@Param('id', new ParseUUIDPipe()) invitId: string): Promise<CnSpaceInvit> {
    return this.spaceAggregateService.refreshInvitationValidUntil(invitId);
  }

  @Put(':id/role/:role')
  public async updateInvitationRole(@Param('id', new ParseUUIDPipe()) invitId: string,
                                    @Param('role', new ParseEnumPipe(CnSpaceUserRole)) role
                                      : CnSpaceUserRole): Promise<CnSpaceInvit> {
    return this.spaceAggregateService.updateInvitationRole(invitId, role);
  }

  @Delete(':id')
  public async deleteInvitation(@Param('id', new ParseUUIDPipe()) invitId: string): Promise<void> {
    return this.spaceAggregateService.deleteInvitation(invitId);
  }

}

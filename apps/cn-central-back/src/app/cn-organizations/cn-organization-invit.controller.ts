import {Body, Controller, Delete, Get, Param, ParseEnumPipe, ParseUUIDPipe, Post, Put} from '@nestjs/common';
import {CnOrganizationAggregateService} from './cn-organization-aggregate.service';
import {CnOrganizationInvitDto} from './cn-organization.dto';
import {CnOrganizationInvit} from './cn-organization-invit.entity';
import {CnOrganizationUserRole} from './cn-organization-user.entity';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {CnUser} from '../cn-users/cn-user.entity';

@Controller('organization-invit')
export class CnOrganizationInvitController {

  constructor(private organizationAggregate: CnOrganizationAggregateService) {
  }

  //////////////////////////////// INVITATION ROUTES ////////////////////////////////

  @BlPublic()
  @Post(':id/accept-new-user')
  public async acceptInvitationNewUser(@Param('id', new ParseUUIDPipe()) invitId: string,
                                @Body(new BlParsePipe(CnUser)) entity: CnUser): Promise<CnUser> {
    return this.organizationAggregate.newUserAcceptsInvitation(invitId, entity);
  }

  @BlPublic()
  @Get(':id')
  public async getInvitations(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnOrganizationInvit> {
    return this.organizationAggregate.getInvitation(id);
  }

  @Post(':id/accept-existing-user')
  public async acceptInvitationExistingUser(@Param('id', new ParseUUIDPipe()) invitId: string): Promise<CnUser> {
    return this.organizationAggregate.existingUserAcceptsInvitation(invitId);
  }

  @Post(':organizationId')
  public async createInvitation(@Param('organizationId') id: string,
                                @Body() invitDto: CnOrganizationInvitDto): Promise<CnOrganizationInvit> {
    return this.organizationAggregate.inviteUserToOrganization(id, invitDto);
  }

  @Put(':id/resend')
  public async resendInvitation(@Param('id', new ParseUUIDPipe()) invitId: string): Promise<void> {
    return this.organizationAggregate.resendInvitation(invitId);
  }

  @Put(':id/refresh-validity')
  public async refreshInvitationValidity(@Param('id', new ParseUUIDPipe()) invitId: string): Promise<CnOrganizationInvit> {
    return this.organizationAggregate.refreshInvitationValidUntil(invitId);
  }

  @Put(':id/role/:role')
  public async updateInvitationRole(@Param('id', new ParseUUIDPipe()) invitId: string,
                                    @Param('role', new ParseEnumPipe(CnOrganizationUserRole)) role
                                      : CnOrganizationUserRole): Promise<CnOrganizationInvit> {
    return this.organizationAggregate.updateInvitationRole(invitId, role);
  }

  @Delete(':id')
  public async deleteInvitation(@Param('id', new ParseUUIDPipe()) invitId: string): Promise<void> {
    return this.organizationAggregate.deleteInvitation(invitId);
  }

}

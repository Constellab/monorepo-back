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
} from '@nestjs/common';
import { CnSpaceAggregateService } from './cn-space-aggregate.service';
import { CnSpaceInvitCreateDto, CnSpaceInvitReadDto } from './cn-space.dto';
import { CnSpaceInvit } from './cn-space-invit.entity';
import { CnSpaceUserRole } from './cn-space-user.entity';
import { BlPublicSecure } from '@monorepo/back-core-lib';
import { CnUser } from '../cn-users/cn-user.entity';
import { ClPage } from '@monorepo/core-lib';

@Controller('space-invit')
export class CnSpaceInvitController {
  constructor(private spaceAggregateService: CnSpaceAggregateService) {}

  //////////////////////////////// INVITATION ROUTES ////////////////////////////////

  @BlPublicSecure()
  @Get('code/:code')
  public async getInvitationByCode(@Param('code') code: string): Promise<CnSpaceInvitReadDto> {
    return this.spaceAggregateService.getInvitationByCode(code);
  }

  @BlPublicSecure()
  @Post('code/:code/accept')
  public async acceptInvitationExistingUser(@Param('code') code: string): Promise<CnUser> {
    return this.spaceAggregateService.existingUserAcceptsInvitation(code);
  }

  @Post(':spaceId')
  public async createInvitation(
    @Param('spaceId') id: string,
    @Body() invitDto: CnSpaceInvitCreateDto
  ): Promise<CnSpaceInvit> {
    return this.spaceAggregateService.inviteUserToSpace(id, invitDto);
  }

  @Put(':id/resend')
  public async resendInvitation(@Param('id', new ParseUUIDPipe()) invitId: string): Promise<void> {
    return this.spaceAggregateService.resendInvitation(invitId);
  }

  @Put(':id/refresh-validity')
  public async refreshInvitationValidity(
    @Param('id', new ParseUUIDPipe()) invitId: string
  ): Promise<CnSpaceInvit> {
    return this.spaceAggregateService.refreshInvitationValidUntil(invitId);
  }

  @Put(':id/role/:role')
  public async updateInvitationRole(
    @Param('id', new ParseUUIDPipe()) invitId: string,
    @Param('role', new ParseEnumPipe(CnSpaceUserRole)) role: CnSpaceUserRole
  ): Promise<CnSpaceInvit> {
    return this.spaceAggregateService.updateInvitationRole(invitId, role);
  }

  @Delete(':id')
  public async deleteInvitation(@Param('id', new ParseUUIDPipe()) invitId: string): Promise<void> {
    return this.spaceAggregateService.deleteInvitation(invitId);
  }

  @Get('space/:id')
  public async getInvitationsBySpace(
    @Param('id') id: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnSpaceInvit>> {
    return this.spaceAggregateService.findInvitationsBySpaceId(id, page, size);
  }
}

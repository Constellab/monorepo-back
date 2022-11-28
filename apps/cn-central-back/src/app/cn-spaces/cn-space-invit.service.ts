import {BadRequestException, Injectable} from '@nestjs/common';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnSpaceInvit} from './cn-space-invit.entity';
import {DataSource, Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {CnSpace} from './cn-space.entity';
import {CnSpaceUserRole} from './cn-space-user.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {CnSpaceInvitDto} from './cn-space.dto';
import {DateTime} from 'luxon';
import {ClDateHelper, ClPage} from '@monorepo/core-lib';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnSpacesMailService} from './cn-spaces-mail.service';


@Injectable()
export class CnSpaceInvitService extends BlAbstractService<CnSpaceInvit> {

  private readonly VALIDITY_DURATION_IN_DAYS = 30;

  constructor(@InjectRepository(CnSpaceInvit) private repository: Repository<CnSpaceInvit>,
              protected datasource: DataSource,
              private spaceMailService: CnSpacesMailService,
              private userService: CnUsersService) {
    super(repository, CnSpaceInvit);
  }

  public async createInvitation(space: CnSpace, invitDto: CnSpaceInvitDto): Promise<CnSpaceInvit> {
    const invit = await this.repository.findOneBy({spaceId: space.id, userMail: invitDto.userMail});

    if (invit) {
      throw new BadRequestException(CnErrorText.SPACE_INVITATION_ALREADY_EXISTS);
    }

    return await this.datasource.transaction(async entityManager => {
      // create invit
      const invit = new CnSpaceInvit();
      invit.space = space;
      invit.userMail = invitDto.userMail;
      invit.role = invitDto.role;
      invit.validUntil = this.getValidUntil();
      const invitDb = await this.create(invit, entityManager);

      // send mail
      const mailSent = await this.sendInvitationMail(invitDb);
      if (!mailSent) {
        throw new BadRequestException(CnErrorText.MAIL_NOT_SENT);
      }

      return invitDb;
    });
  }

  public async resendInvitation(invit: CnSpaceInvit): Promise<void> {
    const mailSent = await this.sendInvitationMail(invit);
    if (!mailSent) {
      throw new BadRequestException(CnErrorText.MAIL_NOT_SENT);
    }
  }

  public async updateInvitationRole(invit: CnSpaceInvit, role: CnSpaceUserRole): Promise<CnSpaceInvit> {
    invit.role = role;
    return this.update(invit);
  }

  public async refreshValidUntil(invit: CnSpaceInvit): Promise<CnSpaceInvit> {
    return await this.datasource.transaction(async entityManager => {

      invit.validUntil = this.getValidUntil();
      const invitDb = await this.update(invit, entityManager);

      // send mail
      const mailSent = await this.sendInvitationMail(invitDb);
      if (!mailSent) {
        throw new BadRequestException(CnErrorText.MAIL_NOT_SENT);
      }

      return invitDb;
    });
  }

  private getValidUntil(): DateTime {
    return ClDateHelper.getDate().plus({days: this.VALIDITY_DURATION_IN_DAYS});
  }

  private async sendInvitationMail(invit: CnSpaceInvit): Promise<boolean> {
    const user = await this.userService.findByEmail(invit.userMail);
    return this.spaceMailService.sendInvitationMail(invit, user, this.VALIDITY_DURATION_IN_DAYS);
  }

  public async findNotificationsBySpaceId(spaceId: string, page: number,
                                          pageSize: number): Promise<ClPage<CnSpaceInvit>> {
    return this.findPaginated(page, pageSize, {
      where: {spaceId: spaceId},
      order: {createdAt: 'DESC' as any},
    });
  }

  public async findByCodeAndCheckValidity(code: string): Promise<CnSpaceInvit> {
    const invit = await this.repository.findOne(
      {
        where: {code: code},
        relations: {space: true}
      });
    if (!invit) {
      throw new BadRequestException(CnErrorText.SPACE_INVITATION_INVALID);
    }
    if (!invit.isValid()) {
      throw new BadRequestException(CnErrorText.SPACE_INVITATION_EXPIRED);
    }
    return invit;
  }

}

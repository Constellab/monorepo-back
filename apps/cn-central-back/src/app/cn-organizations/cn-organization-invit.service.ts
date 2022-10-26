import {BadRequestException, Injectable} from '@nestjs/common';
import {BlAbstractService, BlMailService} from '@monorepo/back-core-lib';
import {CnOrganizationInvit} from './cn-organization-invit.entity';
import {DataSource, Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {CnOrganization} from './cn-organization.entity';
import {CnOrganizationUserRole} from './cn-organization-user.entity';
import {CnMailTemplate} from '../cn-core/model/config/cn-mail-template.class';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {CnOrganizationInvitDto} from './cn-organization.dto';
import {DateTime} from 'luxon';
import {ClDateHelper, ClPage, ClSupportedLanguage} from '@monorepo/core-lib';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnFrontService} from '../cn-core/services/cn-front.service';


@Injectable()
export class CnOrganizationInvitService extends BlAbstractService<CnOrganizationInvit> {

  private readonly VALIDITY_DURATION_IN_DAYS = 30;

  constructor(@InjectRepository(CnOrganizationInvit) private repository: Repository<CnOrganizationInvit>,
              protected datasource: DataSource,
              private mailService: BlMailService,
              private userService: CnUsersService,
              private frontService: CnFrontService) {
    super(repository, CnOrganizationInvit);
  }

  public async createInvitation(organization: CnOrganization, invitDto: CnOrganizationInvitDto): Promise<CnOrganizationInvit> {
    const invit = await this.repository.findOneBy({organizationId: organization.id, userMail: invitDto.userMail});

    if (invit) {
      throw new BadRequestException(CnErrorText.ORGANIZATION_INVITATION_ALREADY_EXISTS);
    }

    return await this.datasource.transaction(async entityManager => {
      // create invit
      const invit = new CnOrganizationInvit();
      invit.organization = organization;
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

  public async resendInvitation(invit: CnOrganizationInvit): Promise<void> {
    const mailSent = await this.sendInvitationMail(invit);
    if (!mailSent) {
      throw new BadRequestException(CnErrorText.MAIL_NOT_SENT);
    }
  }

  public async updateInvitationRole(invit: CnOrganizationInvit, role: CnOrganizationUserRole): Promise<CnOrganizationInvit> {
    invit.role = role;
    return this.update(invit);
  }

  public async refreshValidUntil(invit: CnOrganizationInvit): Promise<CnOrganizationInvit> {
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

  private async sendInvitationMail(invit: CnOrganizationInvit): Promise<boolean> {
    const user = await this.userService.findByEmail(invit.userMail);
    let template: string;
    let lang: ClSupportedLanguage;
    const data = {
      admin: invit.createdBy,
      validityInDays: this.VALIDITY_DURATION_IN_DAYS,
      url: this.frontService.getSignupOrganizationUrl(invit.code),
      user: null as CnUser,
      organizationName: invit.organization.label,
    };

    // if the user already exists
    if (user) {
      template = CnMailTemplate.organization_invit_existing_user;
      // add info about the user
      data.user = user;
      // use lang of the destination user
      lang = user.lang;
    } else {
      template = CnMailTemplate.organization_invit_new_user;
      // user lang of the admin that sent the invitation
      lang = invit.createdBy.lang;
    }

    return this.mailService.sendMail(template, invit.userMail, lang, data);
  }

  public async findNotificationsByOrganization(organizationId: string, page: number,
                                               pageSize: number): Promise<ClPage<CnOrganizationInvit>> {
    return this.findPaginated(page, pageSize, {
      where: {organizationId: organizationId},
      order: {createdAt: 'DESC' as any},
    });
  }

  public async findByCodeAndCheckValidity(code: string): Promise<CnOrganizationInvit> {
    const invit = await this.repository.findOne(
      {
        where: {code: code},
        relations: {organization: true}
      });
    if (!invit) {
      throw new BadRequestException(CnErrorText.ORGANIZATION_INVITATION_INVALID);
    }
    if (!invit.isValid()) {
      throw new BadRequestException(CnErrorText.ORGANIZATION_INVITATION_EXPIRED);
    }
    return invit;
  }

}

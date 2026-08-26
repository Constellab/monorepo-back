import {
  BlBadRequestException,
  BlMailService,
  BlNotFoundException,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { ClStringHelper, ClSupportedLanguage } from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';

import { HnUserDto } from '../../users/hn-user.dto';
import { HnUser } from '../../users/hn-user.entity';
import { HnUserService } from '../../users/hn-user.service';
import { HnInviteStatus } from '../model/config/hn-invite-status.enum';
import { HnUserInvite } from '../model/entities/hn-user-invite.class';
import { HnCurrentUserHelper } from '../utils/hn-current-user.helper';
import { HnFrontService } from './hn-front.service';

export abstract class HnAbstractUserInviteService<T extends HnUserInvite, E> {
  constructor(
    private repository: Repository<HnUserInvite>,
    private userService: HnUserService,
    protected frontService: HnFrontService,
    private mailService: BlMailService
  ) {}

  async createUserInviteMail(entity: E, emailOrId: string): Promise<boolean> {
    const currentUser = HnCurrentUserHelper.getAndCheckCurrentUser();

    const userInviteMail: T = this.initNewUserInvite(entity);
    userInviteMail.token = ClStringHelper.generateUUID();
    userInviteMail.expiresAt = DateTime.now().plus({ days: HnUserInvite.INVITE_EXPIRY_DAYS });
    const { user, email } = await this.resolveInviteRecipient(emailOrId, currentUser);
    userInviteMail.email = email;

    const savedUserInviteMail: T = await this.repository.save(userInviteMail);

    let template: string;
    let lang: ClSupportedLanguage;

    const data = {
      title: this.getInviteEntityTitle(entity),
      url: this.getFrontInviteUrl(savedUserInviteMail.token),
      invitUser: savedUserInviteMail.createdBy,
      user: null as any,
      subscribeUrl: '',
    };

    if (user) {
      template = this.getExistingUserInviteMailTemplate();
      lang = user.lang;
      data.user = {
        firstname: user.firstname,
        lastname: user.lastname,
      };
    } else {
      template = this.getNewUserInviteMailTemplate();
      lang = currentUser.lang;
      data.subscribeUrl = this.frontService.getConstellabLoginUrl();
    }

    return this.mailService.sendMail({
      templateName: template,
      recipients: savedUserInviteMail.email,
      lang: lang,
      data: data,
    });
  }

  /** Resolves the invited user, and the email to invite, from an email address or a user id */
  private async resolveInviteRecipient(
    emailOrId: string,
    currentUser: HnUser
  ): Promise<{ user: HnUser | null; email: string }> {
    if (ClStringHelper.isEmail(emailOrId)) {
      if (emailOrId === currentUser.email) {
        throw new BlBadRequestException('You cannot invite yourself as a co-author');
      }
      return { user: await this.userService.findOneByEmail(emailOrId), email: emailOrId };
    }

    if (!ClStringHelper.isUUID(emailOrId)) throw new BlNotFoundException('User not found');
    if (emailOrId === currentUser.id) {
      throw new BlBadRequestException('You cannot invite yourself as a co-author');
    }
    const user: HnUser | null = await this.userService.findOne(emailOrId);
    if (user == null) {
      throw new BlNotFoundException('User not found');
    }
    return { user: user, email: user.email };
  }

  async getAndCheckInvite(token: string): Promise<T> {
    const userInvite = (await this.repository.findOneBy({
      token: token,
    })) as T;

    if (
      !userInvite ||
      userInvite.status !== HnInviteStatus.PENDING ||
      userInvite.email !== HnCurrentUserHelper.getAndCheckCurrentUser().email
    ) {
      throw new BlUnauthorizedException('This invite is not valid');
    }

    if (userInvite.isExpired()) {
      userInvite.status = HnInviteStatus.EXPIRED;
      await this.repository.save(userInvite);
      throw new BlBadRequestException('This invite has expired');
    }

    return userInvite;
  }

  async acceptUserInvite(userInvite: T): Promise<boolean> {
    userInvite.status = HnInviteStatus.ACCEPTED;
    return (await this.repository.save(userInvite)) != null;
  }

  async deleteUserInvite(inviteId: string): Promise<boolean> {
    const userInvite = await this.repository.findOneBy({ id: inviteId });
    if (!userInvite) return false;
    return (await this.repository.remove(userInvite)) != null;
  }

  async getPendingUserInvitesWithUser(entityId: string): Promise<T[]> {
    const userInvites = await this.getPendingUserInvites(entityId);
    for (const userInvite of userInvites) {
      const user = await this.userService.findOneByEmail(userInvite.email);
      userInvite.user = user ? new HnUserDto(user) : undefined;
    }
    return userInvites;
  }

  protected abstract getExistingUserInviteMailTemplate(): string;

  protected abstract getNewUserInviteMailTemplate(): string;

  protected abstract getPendingUserInvites(entityId: string): Promise<T[]>;

  protected abstract initNewUserInvite(entity: E): T;

  protected abstract getInviteEntityTitle(entity: E): string;

  protected abstract getFrontInviteUrl(token: string): string;
}

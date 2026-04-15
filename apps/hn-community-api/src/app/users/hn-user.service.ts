import {
  BlAbstractPaginatedService,
  BlBadRequestException,
  BlCredentials,
  BlUnauthorizedException,
  BlUserService,
} from '@monorepo/back-core-lib';
import { ClPage, ClStringHelper, ClSupportedLanguage, ClTheme } from '@monorepo/core-lib';
import { TeUser } from '@monorepo/te-text-editor';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';

import { HnExternalCheckCredentialResponse } from '../auth/hn-space-auth.service';
import { HnSiteMapEnumChangefreq, HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnExternalSpaceApiService } from '../core/service/hn-external-space-api.service';
import { HnFrontService } from '../core/service/hn-front.service';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnUserDetailDto, HnUserEditDetailDto } from './hn-user.dto';
import { HnUser, HnUserConstellabDTO, HnUserSearchFilters } from './hn-user.entity';

@Injectable()
export class HnUserService implements BlUserService {
  private readonly logger = new Logger(HnUserService.name);
  constructor(
    @InjectRepository(HnUser)
    private userRepository: Repository<HnUser>,
    private frontService: HnFrontService,
    private spaceApiService: HnExternalSpaceApiService
  ) {}

  async createOrUpdate(user: HnUserConstellabDTO): Promise<void> {
    let u: HnUser = await this.userRepository.findOneBy({ id: user.id });
    if (!u) {
      u = new HnUser();
      u.setData(user);
      await this.userRepository.save(u);
      return;
    }
    if (
      u.firstname !== user.firstname ||
      u.lastname !== user.lastname ||
      u.category !== user.category ||
      u.lang !== user.lang ||
      u.photo !== user.photo
    ) {
      u.firstname = user.firstname;
      u.lastname = user.lastname;
      u.category = user.category;
      u.lang = user.lang;
      u.photo = user.photo;
      u.theme = u.theme != null ? u.theme : user.theme;
      await this.userRepository.save(u);
    }
    return;
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete({ id });
  }

  async findOne(id: string): Promise<HnUser> {
    return await this.userRepository.findOneBy({ id: id });
  }

  async findByIdAndCheck(id: string): Promise<HnUser> {
    const user = await this.userRepository.findOneBy({ id: id });
    if (!user) {
      throw new BlBadRequestException('User not found');
    }
    return user;
  }

  async findUserBasicDTO(id: string): Promise<TeUser> {
    return await this.findByIdAndCheck(id).then((user) => {
      return {
        id: user.id,
        alias: user.alias,
        photo: user.photo,
        firstname: user.firstname,
        lastname: user.lastname,
      };
    });
  }

  async findOneByEmail(email: string): Promise<HnUser> {
    return await this.userRepository.findOneBy({ email: email });
  }

  getCurrent(): HnUser {
    return HnCurrentUserHelper.getCurrentUser();
  }

  async getCount(): Promise<number> {
    return await this.userRepository.count();
  }

  async getUserCredentialsResponse(credentials: BlCredentials): Promise<HnExternalCheckCredentialResponse> {
    const user: HnUser = await this.userRepository.findOneBy({ email: credentials.email });
    if (!user) {
      return {
        status: '2FA_REQUIRED',
      };
    }
    return {
      status: 'OK',
      user: await this.userRepository.findOneBy({ email: credentials.email }),
    };
  }

  async changeLang(lang: ClSupportedLanguage): Promise<void> {
    const user: HnUser = this.getCurrent();
    user.lang = lang;
    await this.userRepository.save(user);
  }

  async changeTheme(theme: ClTheme): Promise<void> {
    const user: HnUser = this.getCurrent();
    if (user.theme != theme) {
      user.theme = theme;
      await this.userRepository.save(user);
    }
  }

  async getUserById(id: string): Promise<HnUserDetailDto> {
    const user = await this.userRepository.findOneBy({ id: id });
    if (!user) {
      throw new BlBadRequestException('User not found');
    }
    return new HnUserDetailDto(user);
  }

  async editUser(data: HnUserEditDetailDto): Promise<HnUserDetailDto> {
    const user = this.getCurrent();

    if (!user || user.id !== data.id) {
      throw new BlUnauthorizedException();
    }

    user.alias = data.alias;
    user.githubLink = data.githubLink;
    user.linkedinLink = data.linkedinLink;
    user.xLink = data.xLink;
    user.interests = data.interests;
    await this.userRepository.save(user);
    return new HnUserDetailDto(user);
  }

  async getAllUsersMap(): Promise<HnSitemapItemBase[]> {
    const users = await this.userRepository.find();
    return users.map((user) => ({
      url: this.frontService.getUserProfileUrl(user.id),
      priority: 0.8,
      changefreq: HnSiteMapEnumChangefreq.MONTHLY,
    }));
  }

  async search(filters: Partial<HnUserSearchFilters>, page: number, size: number): Promise<ClPage<HnUser>> {
    const whereOptions: FindOptionsWhere<HnUser> = {};

    if (filters.email && filters.email.length > 0 && ClStringHelper.isEmail(filters.email)) {
      whereOptions.email = filters.email;
    } else if (filters.alias && filters.alias.length > 0) {
      whereOptions.alias = Like(`%${ClStringHelper.escapeSqlLike(filters.alias)}%`);
    }

    return await BlAbstractPaginatedService.findPaginatedStatic(
      page,
      size,
      {
        where: whereOptions,
        order: { createdAt: 'DESC' as any },
      },
      this.userRepository.manager,
      HnUser
    );
  }

  //////////////////////////// MIGRATION METHODS ////////////////////////////

  async checkAllStatus(): Promise<void> {
    const users: HnUser[] = await this.userRepository.find();
    for (const user of users) {
      const cnUser: any = await this.spaceApiService.checkUserValid(user.id);
      if (!cnUser) {
        this.logger.warn(`Deleting user ${user.id} — not found in space API`);
        await this.userRepository.delete({ id: user.id });
      }
    }
  }
}

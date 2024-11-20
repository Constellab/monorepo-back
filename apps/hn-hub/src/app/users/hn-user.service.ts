import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HnUser, HnUserConstellabDTO } from './hn-user.entity';
import {
  BlBadRequestException,
  BlCredentials,
  BlUnauthorizedException,
  BlUserService,
} from '@monorepo/back-core-lib';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnExternalCheckCredentialResponse } from '../auth/hn-central-auth.service';
import { ClSupportedLanguage, ClTheme } from '@monorepo/core-lib';
import { HnUserDetailDto, HnUserEditDetailDto } from './hn-user.dto';
import { TeUser } from '../../../../../libs/te-text-editor/src/lib/te-user.class';

@Injectable()
export class HnUserService implements BlUserService {
  constructor(
    @InjectRepository(HnUser)
    private userRepository: Repository<HnUser>
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

  async getCurrent(): Promise<HnUser> {
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
    const user: HnUser = await this.getCurrent();
    user.lang = lang;
    await this.userRepository.save(user);
  }

  async changeTheme(theme: ClTheme): Promise<void> {
    const user: HnUser = await this.getCurrent();
    if (user.theme != theme) {
      user.theme = theme;
      await this.userRepository.save(user);
    }
  }

  async getUserById(id: string): Promise<HnUserDetailDto> {
    const user = await this.userRepository.findOneBy({ id: id });
    return new HnUserDetailDto(user);
  }

  async editUser(data: HnUserEditDetailDto): Promise<HnUserDetailDto> {
    const user = await this.getCurrent();

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
}

import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnUser, HnUserConstellabDTO} from './hn-user.entity';
import {BlCredentials, BlUserService} from '@monorepo/back-core-lib';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {HnExternalCheckCredentialResponse} from '../auth/hn-central-auth.service';
import {ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';

@Injectable()
export class HnUserService implements BlUserService {

  constructor(
    @InjectRepository(HnUser)
    private userRepository: Repository<HnUser>
  ) {
  }

  async createOrUpdate(user: HnUserConstellabDTO): Promise<void> {
    let u: HnUser = await this.userRepository.findOneBy({id: user.id});
    if (!u) {
      u = new HnUser();
      u.setData(user);
      await this.userRepository.save(u);
      return;
    }
    if (u.firstname !== user.firstname || u.lastname !== user.lastname ||
      u.category !== user.category || u.lang !== user.lang || u.photo !== user.photo) {
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
    return await this.userRepository.findOneBy({id: id});
  }

  async findOneByEmail(email: string): Promise<HnUser> {
    return await this.userRepository.findOneBy({email: email});
  }

  async getCurrent(): Promise<HnUser> {
    return HnCurrentUserHelper.getCurrentUser();
  }

  async getUserCredentialsResponse(credentials: BlCredentials): Promise<HnExternalCheckCredentialResponse> {
    const user: HnUser = await this.userRepository.findOneBy({email: credentials.email});
    if (!user) {
      return {
        status: '2FA_REQUIRED'
      };
    }
    return {
      status: 'OK',
      user: await this.userRepository.findOneBy({email: credentials.email})
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
}

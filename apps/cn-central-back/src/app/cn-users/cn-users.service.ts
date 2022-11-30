import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnUser, CnUserEditDTO} from './cn-user.entity';
import {Repository} from 'typeorm';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {clLangIsSupported, ClPage, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {
  BlAbstractService,
  BlBucketConfig,
  BlFile,
  BlObjectStorageService,
  BlUserService
} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {IncomingMessage} from 'http';
import {CnCoreConfigService} from '../cn-core/modules/cn-core-config/cn-core-config.service';

@Injectable()
export class CnUsersService extends BlAbstractService<CnUser> implements BlUserService {

  constructor(
    @InjectRepository(CnUser) private repository: Repository<CnUser>,
    private objectStorageService: BlObjectStorageService,
    private configService: CnCoreConfigService) {
    super(repository, CnUser);
  }

  findAllPaginated(page: number, size: number): Promise<ClPage<CnUser>> {
    const currentUser = CnCurrentUserHelper.getCurrentUser();
    if (!currentUser.isAdmin()) {
      throw new UnauthorizedException();
    }

    return this.findPaginated(page, size, {
      order: {lastname: 'ASC', firstname: 'ASC'}
    });
  }

  findAll(): Promise<CnUser[]> {
    return this.repository.find();
  }


  findOne(id: string): Promise<CnUser> {
    return this.repository.findOneBy({id: id});
  }

  findByEmail(email: string): Promise<CnUser> {
    return this.repository.findOne({
      where: {
        email: email,
      }
    });
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  getCurrent(): CnUser {
    return CnCurrentUserHelper.getAndCheckCurrentUser();
  }

  async updateLanguage(lang: ClSupportedLanguage): Promise<void> {
    if (!clLangIsSupported(lang)) {
      throw new BadRequestException(CnErrorText.LANGUAGE_NOT_SUPPORTED);
    }

    const user: CnUser = this.getCurrent();
    user.lang = lang;
    await this.update(user);
  }

  async updateTheme(theme: ClTheme): Promise<void> {
    const user: CnUser = this.getCurrent();
    user.theme = theme;
    await this.update(user);
  }

  async saveNewPhoto(file: BlFile, userId: string): Promise<CnUser> {
    const user: CnUser = await this.repository.findOneBy({id: userId});

    if (user.photo) {
      const lastPhoto: string = user.photo;
      await this.objectStorageService.deleteObjectIfExist(this.getUserProfilePhotoBucketConfig(), lastPhoto);
    }

    user.photo = await this.objectStorageService.uploadObject(
      this.getUserProfilePhotoBucketConfig(), file, true);
    return await this.repository.save(user);
  }

  async deleteCurrentPhoto(userId: string): Promise<void> {
    const user: CnUser = await this.repository.findOneBy({id: userId});
    if (user.photo) {
      await this.objectStorageService.deleteObjectIfExist(this.getUserProfilePhotoBucketConfig(), user.photo);
      user.photo = null;
      await this.repository.save(user);
    }
  }

  async getUserPhoto(userId: string): Promise<IncomingMessage> {
    const user: CnUser = await this.repository.findOneBy({id: userId});
    return this.objectStorageService.getObject(this.getUserProfilePhotoBucketConfig(), user.photo);
  }

  private getUserProfilePhotoBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.configService.getDefaultObjectStorageEndPoint(),
      region: this.configService.getDefaultObjectStorageRegion(),
      bucket: this.configService.getUserProfilePictureObjectStorageBucket(),
      credentials: this.configService.getDefaultObjectStorageCredentials()
    };
  }

  async editUser(userEdit: CnUserEditDTO): Promise<CnUser> {
    const user: CnUser = await this.repository.findOneBy({id: userEdit.id});
    user.firstname = userEdit.firstname;
    user.lastname = userEdit.lastname;
    user.activity = userEdit.activity;
    user.company = userEdit.company;
    user.biography = userEdit.biography;
    return this.repository.save(user);
  }

  async set2FA(enable: boolean): Promise<boolean> {
    const user: CnUser = this.getCurrent();
    user.has2FA = enable;
    await this.repository.save(user);
    return enable;
  }
}

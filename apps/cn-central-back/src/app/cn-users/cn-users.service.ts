import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnUser, CnUserEditDTO, CnUserTransportDto} from './cn-user.entity';
import {Like, Repository} from 'typeorm';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {clLangIsSupported, ClPage, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {
  BlAbstractService,
  BlBadRequestException,
  BlBucketConfig,
  BlFile,
  BlObjectStorageService,
  BlSearchBuilder,
  BlSearchParams,
  BlTransportService,
  BlUnauthorizedException,
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
    private configService: CnCoreConfigService,
    private transportService: BlTransportService) {
    super(repository, CnUser);
  }

  findAllPaginated(page: number, size: number): Promise<ClPage<CnUser>> {
    const currentUser = CnCurrentUserHelper.getCurrentUser();
    if (!currentUser.isAdmin()) {
      throw new BlUnauthorizedException();
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
      throw new BlBadRequestException(CnErrorText.LANGUAGE_NOT_SUPPORTED);
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
      this.getUserProfilePhotoBucketConfig(), file, {generateRandomObjectName: true});
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
    if (userEdit) {
      user.firstname = userEdit.firstname;
      user.lastname = userEdit.lastname;
      user.activity = userEdit.activity;
      user.company = userEdit.company;
      user.biography = userEdit.biography;
      user.phone = userEdit.phone;
      const dbUser: CnUser = await this.repository.save(user);
      this.sendUserToTransport(dbUser);
      return dbUser;
    } else {
      return user;
    }
  }

  async set2FA(enable: boolean): Promise<boolean> {
    const user: CnUser = this.getCurrent();
    user.has2FA = enable;
    await this.repository.save(user);
    return enable;
  }

  public async search(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnUser>> {
    if (!CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()) throw new BlUnauthorizedException();
    const builder = new BlSearchBuilder<CnUser>();
    builder.addSearchParams(searchParams);

    return this.findPaginated(page, size, builder.build());
  }

  public async sendAllUsersToQueue(): Promise<void> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();

    if (!user.isAdmin()) {
      throw new BlUnauthorizedException('You must be an admin to synchronize the versions');
    }

    const users = await this.findAll();
    users.forEach((u) => {
      this.sendUserToTransport(u);
    });
  }


  public sendUserToTransport(user: CnUser): void {
    const u: CnUserTransportDto = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      category: user.category,
      activity: user.activity,
      company: user.company,
      lang: user.lang,
      biography: user.biography
    };
    this.transportService.emit('user', u);
  }

  // Search by name
  public async smartSearchByName(name: string, page: number, size: number): Promise<ClPage<CnUser>> {
    if (!CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()) throw new BlUnauthorizedException();

    if (!name.includes(' ')) {
      return this.searchByLastnameOrFirstname(name, page, size);
    }

    // if there are 2 words, search by lastname and firstname
    // if nothing is found, search by lastname or firstname
    const names = name.split(' ');
    if (names.length === 2) {
      const result = await this.searchByLastnameAndFirstname(names[0], names[1], page, size);

      if (result.totalElements > 0) {
        return result;
      }
    }

    return this.searchByLastnameOrFirstname(name, page, size);
  }

  public searchByLastnameOrFirstname(name: string,
                                     page: number, size: number): Promise<ClPage<CnUser>> {
    return this.findPaginated(page, size, {
      where: [
        {lastname: Like(`%${name}%`)},
        {firstname: Like(`%${name}%`)},
      ],
      order: {firstname: 'ASC', lastname: 'ASC'}
    });
  }

  public async searchByLastnameAndFirstname(name1: string, name2: string,
                                            page: number, size: number): Promise<ClPage<CnUser>> {
    return this.findPaginated(page, size, {
      where: [{
        lastname: Like(`%${name1}%`),
        firstname: Like(`%${name2}%`)
      }, {
        lastname: Like(`%${name2}%`),
        firstname: Like(`%${name1}%`)
      }],
      order: {firstname: 'ASC', lastname: 'ASC'}
    });
  }

}

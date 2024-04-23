import {Injectable, OnModuleInit} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnUser, CnUserEditDTO, CnUserTransportDto} from './cn-user.entity';
import {Like, Repository} from 'typeorm';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {clLangIsSupported, ClPage, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {
  BlAbstractService,
  BlBadRequestException,
  BlBucketConfig,
  BlBucketType,
  BlCsvHelper,
  BlCurrentUserHelper,
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
export class CnUsersService extends BlAbstractService<CnUser> implements BlUserService, OnModuleInit {

  constructor(
    @InjectRepository(CnUser) private repository: Repository<CnUser>,
    private objectStorageService: BlObjectStorageService,
    private configService: CnCoreConfigService,
    private transportService: BlTransportService) {
    super(repository, CnUser);
  }

  async onModuleInit(): Promise<void> {
    const robotUser = await this.getRobotUser();
    BlCurrentUserHelper.setRobotUser(robotUser);
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

  async uploadCurrentUserPhoto(file: BlFile): Promise<CnUser> {
    const user: CnUser = CnCurrentUserHelper.getAndCheckCurrentUser();

    if (user.photo) {
      await this.objectStorageService.deleteObjectIfExist(this.getUserProfilePhotoBucketConfig(), user.photo);
    }

    user.photo = await this.objectStorageService.uploadObject(
      this.getUserProfilePhotoBucketConfig(), file, {generateRandomObjectName: true});
    return await this.repository.save(user);
  }

  async deleteCurrentPhoto(): Promise<CnUser> {
    const user: CnUser = CnCurrentUserHelper.getAndCheckCurrentUser();
    if (user.photo) {
      await this.objectStorageService.deleteObjectIfExist(this.getUserProfilePhotoBucketConfig(), user.photo);
      user.photo = null;
      return await this.repository.save(user);
    }
    return user;
  }

  async getUserPhoto(photoId: string): Promise<IncomingMessage> {
    return this.objectStorageService.getObject(this.getUserProfilePhotoBucketConfig(), photoId);
  }

  private getUserProfilePhotoBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.configService.getDefaultObjectStorageEndPoint(),
      region: this.configService.getDefaultObjectStorageRegion(),
      bucket: this.configService.getUserProfilePictureObjectStorageBucket(),
      credentials: this.configService.getDefaultObjectStorageCredentials(),
      bucketType: BlBucketType.NORMAL,
    };
  }

  async updateUser(userEdit: CnUserEditDTO): Promise<CnUser> {
    const user: CnUser = CnCurrentUserHelper.getAndCheckCurrentUser();
    user.firstname = userEdit.firstname.trim();
    user.lastname = userEdit.lastname.trim();
    user.activity = userEdit.activity?.trim() ?? null;
    user.company = userEdit.company?.trim() ?? null;
    user.biography = userEdit.biography?.trim() ?? null;
    user.phone = userEdit.phone?.trim() ?? null;
    const dbUser: CnUser = await this.repository.save(user);
    this.sendUserToTransport(dbUser);
    return dbUser;
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
    if (!CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()) throw new BlUnauthorizedException();

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
      theme: user.theme,
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

  public getRobotUser(): Promise<CnUser> {
    return this.repository.findOneBy({email: this.configService.getRobotUserMail()});
  }

  /**
   * Export a search to a CSV file
   * @param searchParams
   */
  public async exportSearch(searchParams: BlSearchParams): Promise<string> {
    if (!CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()) throw new BlUnauthorizedException();
    const builder = new BlSearchBuilder<CnUser>();
    builder.addSearchParams(searchParams);

    const users = await this.repository.find(builder.build());

    return BlCsvHelper.toCsv(users, [
      'id', 'firstname', 'lastname', 'email', 'photo',
      'company', 'category', 'status', 'lastLoginSuccess', 'lang', 'theme'
    ]);
  }

}

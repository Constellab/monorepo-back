import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnUser, CnUserEditDTO} from './cn-user.entity';
import {Repository} from 'typeorm';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {clLangIsSupported, ClPage, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {BlAbstractService, BlFile, BlObjectStorageService, BlUserService} from '@monorepo/back-core-lib';
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

  findAll(): Promise<CnUser[]> {
    const currentUser = CnCurrentUserHelper.getCurrentUser();

    if(currentUser.isAdmin()){
      return this.repository.find({
        order: {lastname: 'ASC', firstname: 'ASC'}
      });
    }else{
      if(!currentUser.hasOrganization()){
        throw new UnauthorizedException("You must be in an organization")
      }

      return this.repository.find({
        where: {organizationId: currentUser.organizationId},
        order: {lastname: 'ASC', firstname: 'ASC'}
      });
    }

  }

  findOne(id: string): Promise<CnUser> {
    return this.repository.findOneBy({id: id});
  }

  findByEmail(username: string): Promise<CnUser> {
    return this.repository.findOne({
      where: {
        email: username,
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

  getUsersByOrganization(organizationId: string, page: number, size: number): Promise<ClPage<CnUser>> {
    return this.findPaginated(page, size,
      {
        where: {
          organizationId: organizationId
        },
        order: {
          lastname: 'ASC',
          firstname: 'ASC'
        }
      }
    );
  }

  async saveNewPhoto(file: BlFile, userId: string): Promise<CnUser> {
    const user: CnUser = await this.repository.findOneBy({id: userId});
    const newPhoto: string =
      await this.objectStorageService.uploadObject(file, this.getUserProfilePictureBucket(), true);
    if(user.photo && newPhoto) {
      const lastPhoto: string = user.photo;
      await this.objectStorageService.deleteObject(lastPhoto, this.getUserProfilePictureBucket());
    }
    user.photo = newPhoto;
    return await this.repository.save(user);
  }

  async deleteCurrentPhoto(userId: string): Promise<void>{
    const user: CnUser = await this.repository.findOneBy({id: userId});
    if(user.photo){
      await this.objectStorageService.deleteObject(user.photo, this.getUserProfilePictureBucket());
      user.photo = null;
      await this.repository.save(user);
    }
  }

  async getUserPhoto(userId: string): Promise<IncomingMessage> {
    const user: CnUser = await this.repository.findOneBy({id: userId});
    return this.objectStorageService.getObject(user.photo, this.getUserProfilePictureBucket());
  }

  private getUserProfilePictureBucket(): string {
    return this.configService.getUserProfilePictureObjectStorageBucket();
  }

  async editUser(userEdit: CnUserEditDTO): Promise<CnUser> {
    const user: CnUser = await this.repository.findOneBy({id: userEdit.id});
    user.firstname = userEdit.firstname;
    user.lastname = userEdit.lastname;
    user.email = userEdit.email;
    return this.repository.save(user);
  }
}

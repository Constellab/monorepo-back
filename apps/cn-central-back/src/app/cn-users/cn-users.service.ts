import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnUser} from './cn-user.entity';
import {Repository} from 'typeorm';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {clLangIsSupported, ClPage, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';
import {BlAbstractService, BlUserService} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';

@Injectable()
export class CnUsersService extends BlAbstractService<CnUser> implements BlUserService {

  constructor(
    @InjectRepository(CnUser) private repository: Repository<CnUser>) {
    super(repository, CnUser);
  }

  findAll(): Promise<CnUser[]> {
    return this.repository.find({
      order: {lastname: 'ASC', firstname: 'ASC'}
    });
  }

  findOne(id: string): Promise<CnUser> {
    return this.repository.findOne(id);
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
}

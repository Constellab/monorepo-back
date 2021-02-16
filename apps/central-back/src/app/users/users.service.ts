import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from './user.entity';
import {Repository} from 'typeorm';
import {AbstractService} from '../core/class/abstract.service';
import {RequestContextHelper} from '../core/modules/request-context/request-context.helper';
import {ErrorText} from '../core/model/config/error-text.class';
import {clLangIsSupported, ClSupportedLanguage, ClTheme} from '@monorepo/core-lib';

@Injectable()
export class UsersService extends AbstractService<User> {

  constructor(
    @InjectRepository(User) private repository: Repository<User>) {
    super(repository, User);
  }

  findAll(): Promise<User[]> {
    return this.repository.find({
      order: {lastname: 'ASC', firstname: 'ASC'}
    });
  }

  findOne(id: string): Promise<User> {
    return this.repository.findOne(id);
  }

  findByEmail(username: string): Promise<User> {
    return this.repository.findOne({
      where: {
        email: username,
      }
    });
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  getCurrent(): User {
    return RequestContextHelper.getAndCheckCurrentUser();
  }

  async updateLanguage(lang: ClSupportedLanguage): Promise<void> {
    if (!clLangIsSupported(lang)) {
      throw new BadRequestException(ErrorText.LANGUAGE_NOT_SUPPORTED);
    }

    const user: User = this.getCurrent();
    user.lang = lang;
    await this.update(user);
  }

  async updateTheme(theme: ClTheme): Promise<void> {
    const user: User = this.getCurrent();
    user.theme = theme;
    await this.update(user);
  }


}

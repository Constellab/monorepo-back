import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnUser, HnUserConstellabDTO} from './hn-user.entity';
import {BlUserService} from '@monorepo/back-core-lib';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {CmCredentials} from '@monorepo/common-model';
import {HnExternalCheckCredentialResponse} from '../auth/hn-central-auth.service';

@Injectable()
export class HnUserService implements BlUserService{

  constructor(
    @InjectRepository(HnUser)
    private userRepository: Repository<HnUser>
  ){}

  async createOrUpdate(user: HnUserConstellabDTO): Promise<void>{
    let u: HnUser = await this.userRepository.findOneBy({id: user.id});
    if(!u){
      u = new HnUser();
      u.setData(user);
      await this.userRepository.save(u);
      return;
    }
    if(u.firstname !== user.firstname || u.lastname !== user.lastname || u.category !== user.category || u.lang !== user.lang){
      u.firstname = user.firstname;
      u.lastname = user.lastname;
      u.category = user.category;
      u.lang = user.lang;
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

  async getCurrent(): Promise<HnUser>{
    return HnCurrentUserHelper.getCurrentUser();
  }

  async getUserCredentialsResponse(credentials: CmCredentials): Promise<HnExternalCheckCredentialResponse> {
    const user: HnUser = await this.userRepository.findOneBy({email: credentials.email});
    if(!user){
      return {
        status: '2FA_REQUIRED'
      }
    }
    return {
      status: 'OK',
      user: await this.userRepository.findOneBy({email: credentials.email})
    }
  }
}

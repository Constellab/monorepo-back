import {Injectable} from '@nestjs/common';
import {HnSpaceUser} from './space-user/hn-space-user.entity';
import {HnSpaceUserService} from './space-user/hn-space-user.service';
import {HnSpaceService} from './space/hn-space.service';
import {HnUserService} from '../users/hn-user.service';
import {BlBadRequestException} from '@monorepo/back-core-lib';
import {HnSpace} from './space/hn-space.entity';

@Injectable()
export class HnSpaceAggregateService {

  constructor(
    private readonly spaceService: HnSpaceService,
    private readonly spaceUserService: HnSpaceUserService,
    private readonly userService: HnUserService
  ) {
  }

  ////////////////////////// SPACE ////////////////////////////
  public async checkOrCreateSpace(space: HnSpace): Promise<void>{
    const spaceObj = await this.spaceService.findOne(space.id);
    if(!spaceObj){
      await this.spaceService.create(space);
    }
  }

  public async checkIfSpaceExists(spaceId: string): Promise<void> {
    if((await this.spaceService.findOne(spaceId)) == null){
      throw new BlBadRequestException("Space does not exist");
    }
  }


  //////////////////////////// SPACE USER ////////////////////////////

  public async createOrUpdateSpaceUser(spaceUserDto: HnSpaceUser): Promise<void> {
    if(!(await this.checkIfUserExists(spaceUserDto.userId))) {
      if (spaceUserDto.user == null) return;

      await this.userService.createOrUpdate(spaceUserDto.user);
    }

    if(spaceUserDto.space != null && (await this.checkIfUserExists(spaceUserDto.space.createdBy.id))){
      await this.checkOrCreateSpace(spaceUserDto.space);
    }

    await this.checkIfSpaceExists(spaceUserDto.spaceId);

    const existentSpaceUser = await this.spaceUserService.findSpaceUserByIds(spaceUserDto.spaceId, spaceUserDto.userId);

    if(existentSpaceUser != null){
      existentSpaceUser.role = spaceUserDto.role ?? existentSpaceUser.role;
      existentSpaceUser.active = spaceUserDto.active ?? existentSpaceUser.active;
      await this.spaceUserService.updateSpaceUser(existentSpaceUser);
    } else {
      const spaceUserObj: HnSpaceUser = new HnSpaceUser();
      spaceUserObj.spaceId = spaceUserDto.spaceId;
      spaceUserObj.userId = spaceUserDto.userId;
      spaceUserObj.role = spaceUserDto.role;
      spaceUserObj.active = spaceUserDto.active;
      spaceUserObj.addedBy = spaceUserDto.addedBy;
      spaceUserObj.createdAt = spaceUserDto.createdAt;

      await this.spaceUserService.createSpaceUser(spaceUserObj);
    }
  }

  public async deleteSpaceUser(spaceUserDto: Partial<HnSpaceUser>): Promise<void> {
    if(!(await this.checkIfUserExists(spaceUserDto.userId))) return;

    await this.checkIfSpaceExists(spaceUserDto.spaceId);

    const existentSpaceUser = await this.spaceUserService.findSpaceUserByIds(spaceUserDto.spaceId, spaceUserDto.userId);

    if(existentSpaceUser != null){
      await this.spaceUserService.deleteSpaceUser(existentSpaceUser);
    }
  }


  //////////////////////////// USER ////////////////////////////
  public async checkIfUserExists(userId: string): Promise<boolean> {
    return (await this.userService.findOne(userId)) != null
  }

}

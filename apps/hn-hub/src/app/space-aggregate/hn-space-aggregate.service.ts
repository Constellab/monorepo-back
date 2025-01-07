import { Injectable } from '@nestjs/common';
import { HnSpaceUser } from './space-user/hn-space-user.entity';
import { HnSpaceUserService } from './space-user/hn-space-user.service';
import { HnSpaceService } from './space/hn-space.service';
import { HnUserService } from '../users/hn-user.service';
import { BlBadRequestException, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { HnSpace } from './space/hn-space.entity';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnLabConstellabApiService } from '../core/service/hn-lab-constellab-api.service';
import { HnSpaceDto } from './space/hn-space.dto';
import { Request } from 'express';

@Injectable()
export class HnSpaceAggregateService {
  constructor(
    private readonly spaceService: HnSpaceService,
    private readonly spaceUserService: HnSpaceUserService,
    private readonly userService: HnUserService,
    private readonly labConstellabApiService: HnLabConstellabApiService
  ) {}

  ////////////////////////// SPACE ////////////////////////////
  public async findSpaces(): Promise<HnSpaceDto[]> {
    return (await this.spaceService.find()).map((space) => new HnSpaceDto(space));
  }

  public async findSpacesOfUser(userId: string): Promise<HnSpace[]> {
    const spaceUsers = await this.spaceUserService.findActiveSpaceUsersByUserId(userId);
    return spaceUsers.map((spaceUser) => spaceUser.space);
  }

  public async findSpacesOfCurrentUser(): Promise<HnSpaceDto[]> {
    const spaceUsers = await this.spaceUserService.findActiveSpaceUsersByUserId(
      HnCurrentUserHelper.getAndCheckCurrentUser().id
    );
    return spaceUsers.map((spaceUser) => new HnSpaceDto(spaceUser.space));
  }

  public async checkOrCreateSpace(space: HnSpace): Promise<void> {
    const spaceObj = await this.spaceService.findOne(space.id);
    if (!spaceObj) {
      await this.spaceService.create(space);
      return;
    }
    await this.spaceService.update(space);
  }

  public async checkIfSpaceExists(spaceId: string): Promise<void> {
    if ((await this.spaceService.findOne(spaceId)) == null) {
      throw new BlBadRequestException('Space does not exist');
    }
  }

  public async getSpacesForLab(req: Request): Promise<HnSpaceDto[]> {
    await this.labConstellabApiService.checkApiKeyAndUserIdInCentral(req);
    return (await this.findSpacesOfUser(req.header('user'))).map((space) => new HnSpaceDto(space));
  }

  //////////////////////////// SPACE USER ////////////////////////////

  public async createOrUpdateSpaceUser(spaceUserDto: HnSpaceUser): Promise<void> {
    if (!(await this.checkIfUserExists(spaceUserDto.userId))) {
      if (spaceUserDto.user == null) return;

      await this.userService.createOrUpdate(spaceUserDto.user);
    }

    if (spaceUserDto.space != null && (await this.checkIfUserExists(spaceUserDto.space.createdBy.id))) {
      await this.checkOrCreateSpace(spaceUserDto.space);
    }

    await this.checkIfSpaceExists(spaceUserDto.spaceId);

    const existentSpaceUser = await this.spaceUserService.findSpaceUserByIds(
      spaceUserDto.spaceId,
      spaceUserDto.userId
    );

    if (existentSpaceUser != null) {
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

  public async deleteSpace(spaceDto: Partial<HnSpace>): Promise<void> {
    await this.checkIfSpaceExists(spaceDto.id);

    await this.spaceService.delete(spaceDto.id);
  }

  public async deleteSpaceUser(spaceUserDto: Partial<HnSpaceUser>): Promise<void> {
    if (!(await this.checkIfUserExists(spaceUserDto.userId))) return;

    await this.checkIfSpaceExists(spaceUserDto.spaceId);

    const existentSpaceUser = await this.spaceUserService.findSpaceUserByIds(
      spaceUserDto.spaceId,
      spaceUserDto.userId
    );

    if (existentSpaceUser != null) {
      await this.spaceUserService.deleteSpaceUser(existentSpaceUser);
    }
  }

  public checkSpaceUser(spaceId: string, userId: string): Promise<boolean> {
    return this.spaceUserService.checkSpaceUser(spaceId, userId);
  }

  public async assertCheckSpaceUser(spaceId: string, userId: string): Promise<void> {
    await this.checkIfSpaceExists(spaceId);
    await this.checkIfUserExists(userId);
    await this.spaceUserService.assertUserIsSpaceUser(spaceId, userId);
  }

  public async checkCurrentUserIsInGencoverySpace(): Promise<boolean> {
    const user = HnCurrentUserHelper.getCurrentUser();
    if (!user) {
      return false;
    }

    if (user.isAdmin()) return true;

    const gencoverySpace = await this.spaceService.getGencoverySpace();
    if (!gencoverySpace) {
      return false;
    }

    return this.spaceUserService.checkSpaceUser(gencoverySpace.id, user.id);
  }

  public async assertCurrentUserIsInGencoverySpace(): Promise<void> {
    if (!(await this.checkCurrentUserIsInGencoverySpace())) {
      throw new BlUnauthorizedException();
    }
  }

  public async getUserCommonSpace(userId: string): Promise<HnSpaceDto[]> {
    const currentUser = HnCurrentUserHelper.getAndCheckCurrentUser();
    const currentUserSpaces = await this.findSpacesOfUser(currentUser.id);
    const userSpaces = await this.findSpacesOfUser(userId);

    return currentUserSpaces
      .filter((space) => userSpaces.some((userSpace) => userSpace.id === space.id))
      .map((space) => new HnSpaceDto(space));
  }

  //////////////////////////// USER ////////////////////////////
  public async checkIfUserExists(userId: string): Promise<boolean> {
    return (await this.userService.findOne(userId)) != null;
  }
}

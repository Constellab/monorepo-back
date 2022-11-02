import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnLabInstanceGroup, CnLabInstanceGroupRole} from './cn-lab-instance-group.entity';
import {In, Repository} from 'typeorm';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnGroup} from '../cn-groups/cn-group.entity';
import {CnGroupsService} from '../cn-groups/cn-groups.service';

@Injectable()
export class CnLabInstanceGroupService {


  constructor(@InjectRepository(CnLabInstanceGroup) private repository: Repository<CnLabInstanceGroup>,
              private groupService: CnGroupsService) {
  }

  public async createLabInstanceGroup(labInstance: CnLabInstance, group: CnGroup,
                                      role: CnLabInstanceGroupRole): Promise<CnLabInstanceGroup> {
    const labInstanceGroupDb = this.findByLabInstanceIdAndGroupId(labInstance.id, group.id);

    if (labInstanceGroupDb) {
      throw new BadRequestException(CnErrorText.LAB_ALREADY_SHARED_WITH_GROUP);
    }

    const labInstanceGroup = new CnLabInstanceGroup();
    labInstanceGroup.labInstance = labInstance;
    labInstanceGroup.group = group;
    labInstanceGroup.role = role;

    return this.repository.save(labInstanceGroup);
  }

  public async updateLabInstanceGroupRole(labInstanceId: string, groupId: string,
                                          role: CnLabInstanceGroupRole): Promise<CnLabInstanceGroup> {

    const labInstanceGroup = await this.findByLabInstanceIdAndGroupId(labInstanceId, groupId);

    if (labInstanceGroup == null) {
      throw new BadRequestException(CnErrorText.LAB_NOT_SHARED_WITH_GROUP);
    }

    // if the role was changed from admin to user, check that there is at least one admin
    if (labInstanceGroup.role === CnLabInstanceGroupRole.OWNER && role === CnLabInstanceGroupRole.USER) {
      await this.checkLabAdminsCount(labInstanceId);
    }

    labInstanceGroup.role = role;
    return this.repository.save(labInstanceGroup);
  }

  public async deleteLabInstanceGroup(labInstanceId: string, groupId: string): Promise<void> {
    const labInstanceGroup = await this.findByLabInstanceIdAndGroupId(labInstanceId, groupId);

    if (labInstanceGroup == null) {
      throw new BadRequestException(CnErrorText.LAB_NOT_SHARED_WITH_GROUP);
    }

    // check that there is at least one admin
    if (labInstanceGroup.role === CnLabInstanceGroupRole.OWNER) {
      await this.checkLabAdminsCount(labInstanceId);
    }

    await this.repository.delete({labInstanceId: labInstanceId, groupId: groupId});
  }

  private async checkLabAdminsCount(labInstanceId: string): Promise<void> {
    const labAdminsCount = await this.countLabAdmins(labInstanceId);
    if (labAdminsCount === 1) {
      throw new BadRequestException(CnErrorText.LAB_CANNOT_REMOVE_LAST_ADMIN);
    }
  }

  private countLabAdmins(labInstanceId: string): Promise<number> {
    return this.repository.countBy({
      labInstanceId: labInstanceId,
      role: CnLabInstanceGroupRole.OWNER
    });
  }

  private async findByLabInstanceIdAndGroupId(labInstanceId: string, groupId: string): Promise<CnLabInstanceGroup> {
    return this.repository.findOneBy({
      labInstanceId: labInstanceId,
      groupId: groupId
    });
  }

  public findByLabInstanceId(labInstanceId: string): Promise<CnLabInstanceGroup[]> {
    return this.repository.find({
      where: {
        labInstanceId: labInstanceId
      }
    });
  }

  public async findUserRoleForLab(labInstanceId: string, userId: string, organizationId: string): Promise<CnLabInstanceGroupRole> {
    // retrieve all the group of the user for the organization
    const userGroups = await this.groupService.getAllGroupsOfUser(userId, organizationId);

    const sharedGroups = await this.repository.find({
      where: {
        labInstanceId: labInstanceId,
        groupId: In(userGroups.map(group => group.id))
      }
    });

    if (sharedGroups.length === 0) return null;

    // if one of the group is owner, return owner
    if (sharedGroups.some(group => group.role === CnLabInstanceGroupRole.OWNER)) {
      return CnLabInstanceGroupRole.OWNER;
    }
    return CnLabInstanceGroupRole.USER;
  }

}

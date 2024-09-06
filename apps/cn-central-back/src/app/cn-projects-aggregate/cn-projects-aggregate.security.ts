import { Injectable } from '@nestjs/common';
import { CnUserSpaceInfo } from '../cn-users/cn-user.dto';
import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnProjectUserService } from './cn-project-user/cn-project-user.service';
import { CnFolderHierarchy } from './cn-folder-hierarchies/cn-folder-hierarchy.entity';
import { CnFolderHierarchyService } from './cn-folder-hierarchies/cn-folder-hierarchy.service';


/**
 * Class to check the user authorization on projects
 */
@Injectable()
export class CnProjectsAggregateSecurity {

  constructor(private folderObjectService: CnFolderHierarchyService,
              private projectUserService: CnProjectUserService) {
  }

  public async checkFindOneAndGetRootProject(folder: CnFolderHierarchy, userInfo: CnUserSpaceInfo): Promise<CnFolderHierarchy> {
    // check the space context
    if (folder.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException('Wrong space');

    // the authorization are handle at the projet level
    const rootFolder = await this.folderObjectService.getRootFolder(folder);

    if (userInfo.isSpaceAdmin()) return rootFolder;

    // enable always the leader to have access to the project
    if (rootFolder.user.id === userInfo.userId) return rootFolder;

    // check if the user is a member of one of the groups that were shared with the project
    if (!await this.projectUserService.userIsInRootFolder(rootFolder.id, userInfo.userId)) {
      throw new BlUnauthorizedException(CnErrorText.NO_ACCESS_TO_PROJECT);
    }

    return rootFolder;
  }


  public async checkFindOne(folder: CnFolderHierarchy, userInfo: CnUserSpaceInfo): Promise<void> {
    await this.checkFindOneAndGetRootProject(folder, userInfo);
  }

  // TODO check if we keep project object here
  public async checkUpdate(folder: CnFolderHierarchy, userInfo: CnUserSpaceInfo): Promise<void> {
    // check the space context
    if (folder.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException('Wrong space');

    if (userInfo.isSpaceAdmin()) return;

    if (folder.user.id !== userInfo.userId) {
      throw new BlUnauthorizedException(CnErrorText.NO_PROJECT_LEADER);
    }
  }

  /**
   * Only the leader or leader of a parent project can update the leader of children project
   */
  public async checkUpdateProjectLeader(project: CnFolderHierarchy, userInfo: CnUserSpaceInfo): Promise<void> {
    // check the space context
    if (project.spaceId !== userInfo.spaceId) throw new BlUnauthorizedException('Wrong space');

    if (userInfo.isSpaceAdmin()) return;

    const ancestors = await this.folderObjectService.getAncestors(project);
    for (const ancestor of ancestors) {
      if (ancestor.user.id === userInfo.userId) {
        return;
      }
    }
    throw new BlUnauthorizedException();
  }

  public async checkFindAllBySpace(userInfo: CnUserSpaceInfo): Promise<void> {
    // check the space context
    if (!userInfo.isSpaceAdmin()) throw new BlUnauthorizedException('Only space admin can list all projects');
  }
}

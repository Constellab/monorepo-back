import { BlBadRequestException, BlUnauthorizedException, BlUserStatus } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CnActivityService } from '../cn-activity/cn-activity.service';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnHierarchyObjectService } from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object.service';
import { CnHierarchyObjectAggregateService } from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object-aggregate.service';
import { CnGroupsService } from '../cn-groups/cn-groups.service';
import { CnNotificationService } from '../cn-notification/cn-notification.service';
import { CnSpaceAggregateService } from '../cn-spaces/cn-space-aggregate.service';
import { CnUserEntity } from '../cn-users/cn-user.entity';
import { CnUsersService } from '../cn-users/cn-users.service';

/**
 * Aggregate service to handle complex user deletion operations
 * This service coordinates deletion across multiple domains: folders, spaces, groups, and users
 */
@Injectable()
export class CnUserDeletionAggregateService {
  private readonly logger = new Logger(CnUserDeletionAggregateService.name);

  constructor(
    private usersService: CnUsersService,
    private hierarchyObjectAggregateService: CnHierarchyObjectAggregateService,
    private hierarchyObjectService: CnHierarchyObjectService,
    private spaceAggregateService: CnSpaceAggregateService,
    private groupService: CnGroupsService,
    private activityService: CnActivityService,
    private notificationService: CnNotificationService,
    private datasource: DataSource
  ) {}

  /**
   * Delete a user and all associated data (folders, activities, space, groups)
   * Steps:
   * 1. Get all root folders from user's personal space
   * 2. Delete all root folders (and their children) - NOT in transaction
   * 3. Delete activities associated with the personal space
   * 4. Delete personal space, own group, and user entity - IN transaction
   */
  public async deleteUser(userId: string): Promise<void> {
    if (!CnCurrentUserHelper.getAndCheckCurrentUser().isAdmin()) throw new BlUnauthorizedException();

    const user = await this.usersService.findByIdAndCheck(userId);

    // only delete user with mail not validated
    if (user.status !== BlUserStatus.WAITING_FOR_EMAIL) {
      throw new BlBadRequestException('Only users with not validated email can be deleted');
    }

    this.logger.log(`Starting deletion process for user ${userId}`);

    // Get user's personal space (needed for activity deletion)
    const personalSpace = await this.spaceAggregateService.getUserPersonalSpaceAndCheck(userId);

    // Step 1 & 2: Delete all root folders and their children (not in transaction)
    await this.deleteUserRootFolders(userId, personalSpace.id);

    // Step 3: Delete all activities associated with the personal space
    await this.deleteUserActivities(personalSpace.id);

    // Step 3.5: Delete all notifications created by the user
    await this.notificationService.deleteAllNotificationLinkedToUser(userId);

    // Step 4: Delete space, group, and user in transaction
    await this.datasource.transaction(async (entityManager) => {
      await this.spaceAggregateService.deletePersonalSpace(userId, entityManager);

      await this.groupService.deleteOwnGroup(userId, entityManager);

      await entityManager.delete(CnUserEntity, userId);
    });

    this.logger.log(`Completed deletion process for user ${userId}`);
  }

  /**
   * Delete all root folders from user's personal space
   * This is done outside the transaction as requested
   */
  private async deleteUserRootFolders(userId: string, spaceId: string): Promise<void> {
    try {
      // Get all root folders of the user in their personal space
      const rootFolders = await this.hierarchyObjectService.getAllRootFoldersOfUser(userId, spaceId);

      this.logger.log(`Deleting ${rootFolders.length} root folders for user ${userId}`);

      // Delete each root folder (this will cascade to all children)
      for (const rootFolder of rootFolders) {
        try {
          await this.hierarchyObjectAggregateService.deleteHierarchyObjectAndChildren(rootFolder, true);
          this.logger.log(`Successfully deleted root folder ${rootFolder.id} (${rootFolder.name})`);
        } catch (error: any) {
          this.logger.error(`Error deleting root folder ${rootFolder.id}: ${error}`);
          // Continue with other folders even if one fails
        }
      }
    } catch (error: any) {
      this.logger.error(`Error getting or deleting root folders for user ${userId}: ${error}`);
      // Don't throw - we want to continue with user deletion even if folder deletion fails
    }
  }

  /**
   * Delete all activities associated with the user's personal space
   */
  private async deleteUserActivities(spaceId: string): Promise<void> {
    try {
      await this.activityService.deleteBySpaceId(spaceId);
      this.logger.log(`Successfully deleted activities for space ${spaceId}`);
    } catch (error: any) {
      this.logger.error(`Error deleting activities for space ${spaceId}: ${error}`);
      // Don't throw - we want to continue with user deletion even if activity deletion fails
    }
  }
}

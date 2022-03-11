import {Component, Input, OnInit} from '@angular/core';
import {
  FlArrayObs,
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlEntityArrayObs
} from '@monorepo/front-core-lib';
import {CaGroup} from '../../../../../ca-core/model/entities/ca-group.entity';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {
  CaGroupShareDialogComponent,
  CaGroupShareDialogInput
} from '../../../../../ca-core/entity-module/ca-group-core/component/ca-group-share-dialog/ca-group-share-dialog.component';

/**
 * Component to list the groups where the project is shared with. with button to share or unshare with group
 */
@Component({
  selector: 'ca-project-shared-groups-list',
  templateUrl: './ca-project-shared-groups-list.component.html',
  styleUrls: ['./ca-project-shared-groups-list.component.scss']
})
export class CaProjectSharedGroupsListComponent implements OnInit {

  @Input() projectId: string;

  groupsArray: FlArrayObs<CaGroup>;

  constructor(private projectService: CaProjectService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.groupsArray = new FlEntityArrayObs(this.projectService.getProjectSharedGroups(this.projectId));
  }

  openShareDialog(): void {
    const input: CaGroupShareDialogInput = {
      share: group => this.projectService.shareProject(this.projectId, group.id)
    };

    this.dialogService.openSmallDialog(CaGroupShareDialogComponent, {data: input}).afterClosed().subscribe(
      group => this.onShareDialogClosed(group)
    );
  }

  private onShareDialogClosed(group?: CaGroup): void {
    if (group) {
      this.groupsArray.addItem(group, () => true);
    }
  }

  openUnshareDialog(group: CaGroup): void {
    const input: FlConfirmDialogInput = {
      title: 'unshare',
      content: 'unshare_confirmation',
      translateTitleAndContent: true,
      observable: this.projectService.unshareProject(this.projectId, group.id),
      successMessage: 'unshared',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onRemoveSharingClosed(result, group)
    );
  }

  private onRemoveSharingClosed(result: FlConfirmDialogResult, group: CaGroup): void {
    if (result.choice) {
      this.groupsArray.removeItem(group);
    }
  }

}

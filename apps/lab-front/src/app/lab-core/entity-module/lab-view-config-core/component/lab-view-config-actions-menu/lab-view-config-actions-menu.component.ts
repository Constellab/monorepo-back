import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LabTag} from '../../../../model/entities/lab-tag.entity';
import {FlDialogService, FlTagDialogService} from '@monorepo/front-core-lib';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';
import {LabViewConfigService} from '../../../../entity-service/lab-view-config.service';
import {
  LabUpdateViewConfigDialogComponent
} from '../lab-update-view-config-dialog/lab-update-view-config-dialog.component';

/**
 * Actions menu button for view configs, it has a ng-content for custom buttons
 */
@Component({
  selector: 'lab-view-config-actions-menu',
  templateUrl: './lab-view-config-actions-menu.component.html',
  styleUrls: ['./lab-view-config-actions-menu.component.scss']
})
export class LabViewConfigActionsMenuComponent implements OnInit {

  @Input() viewConfig: LabViewConfig;

  @Output() update: EventEmitter<LabViewConfig> = new EventEmitter();
  @Output() updateTags: EventEmitter<LabTag[]> = new EventEmitter();

  constructor(private viewConfigService: LabViewConfigService,
              private dialogService: FlDialogService,
              private tagDialogService: FlTagDialogService) {
  }

  ngOnInit(): void {
  }

  openUpdateName(): void {
    this.dialogService.openSmallDialog(LabUpdateViewConfigDialogComponent,
      {data: this.viewConfig}).afterClosed().subscribe(
      updatedResource => this.onUpdateResourceClosed(updatedResource)
    );
  }

  private onUpdateResourceClosed(viewConfig?: LabViewConfig): void {
    if (viewConfig) {
      this.update.next(viewConfig);
    }
  }


  openTagFormDialog(): void {
    this.tagDialogService.openUpdateTagDialog({
      tags: this.viewConfig.tags,
      updateMethod: (tags) => this.viewConfigService.saveTags(this.viewConfig.id, tags)
    }).afterClosed().subscribe(
      (newTags: LabTag[]) => this.onTagClosed(newTags)
    );
  }

  private onTagClosed(newTags: LabTag[]): void {
    if (newTags != null) {
      this.updateTags.next(newTags);
    }
  }

}

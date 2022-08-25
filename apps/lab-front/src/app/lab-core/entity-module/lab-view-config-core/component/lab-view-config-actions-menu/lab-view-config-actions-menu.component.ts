import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LabTag} from '../../../../model/entities/lab-tag.entity';
import {FlDialogService, FlSnackBarService, FlTagDialogService} from '@monorepo/front-core-lib';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';
import {LabViewConfigService} from '../../../../entity-service/lab-view-config.service';
import {
  LabUpdateViewConfigDialogComponent
} from '../lab-update-view-config-dialog/lab-update-view-config-dialog.component';
import {ClHelpService} from '@monorepo/core-lib';
import {
  LabSelectReportDialogComponent
} from '../../../lab-report-core/component/lab-select-report-dialog/lab-select-report-dialog.component';
import {LabReport} from '../../../../model/entities/lab-report.entity';
import {LabReportService} from '../../../../entity-service/lab-report.service';

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

  addToReportIsLoading: boolean = false;

  constructor(private viewConfigService: LabViewConfigService,
              private dialogService: FlDialogService,
              private tagDialogService: FlTagDialogService,
              private reportService: LabReportService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
  }

  stopPropagation(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
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

  openSelectReport(): void {
    this.dialogService.openBigDialog(LabSelectReportDialogComponent).afterClosed().subscribe(
      report => this.onSelectReportClosed(report)
    );
  }

  private onSelectReportClosed(report?: LabReport): void {
    if (!report) return;

    this.addToReportIsLoading = true;
    this.reportService.addViewToContent(report.id, this.viewConfig.id).subscribe(
      {
        next: () => this.onSuccess(),
        error: () => this.addToReportIsLoading = false
      });

  }

  private onSuccess(): void {
    this.snackBarService.openSuccessMessage({text: 'biox.view_added_to_report', translateText: true});
    this.addToReportIsLoading = false;
  }

}

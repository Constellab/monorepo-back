import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Study, StudyStatus, studyStatusDict} from '../../../../../core/model/entities/study.class';
import {StudyService} from '../../../../service/study.service';
import {
  StudyFormDialogComponent,
  StudyFormDialogInput
} from '../../../study-core/component/study-form-dialog/study-form-dialog.component';
import {
  UpdateStatusFormDialogComponent,
  UpdateStatusFormDialogInput
} from '../../../../../core/module/status/update-status-form-dialog/update-status-form-dialog.component';
import {
  StatusHistoryListDialogComponent,
  StatusHistoryListDialogInput
} from '../../../../../core/module/status/status-history-list-dialog/status-history-list-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-study-detail',
  templateUrl: './study-detail.component.html',
  styleUrls: ['./study-detail.component.scss']
})
export class StudyDetailComponent implements OnInit {

  @Input() study: Study;

  @Output() update: EventEmitter<Study> = new EventEmitter<Study>();

  constructor(private dialogService: FlDialogService,
              private studyService: StudyService) {
  }

  ngOnInit(): void {
  }

  openUpdateDialog(): void {
    const dialogInput: StudyFormDialogInput = {
      mode: 'update',
      object: this.study,
    };
    this.dialogService.openSmallDialog(StudyFormDialogComponent, {data: dialogInput}).afterClosed().subscribe(
      newExp => this.onUpdateDialogClosed(newExp)
    );
  }

  private onUpdateDialogClosed(study: Study): void {
    if (study) {
      this.update.emit(study);
    }
  }

  openUpdateStatusDialog(): void {
    const dialogInput: UpdateStatusFormDialogInput<StudyStatus> = {
      statusDict: studyStatusDict,
      currentStatus: this.study.currentStatus.status,
      updateStatus: this.studyService.getUpdateStatusMethod(this.study.id),
      title: 'update_study_status'
    };
    this.dialogService.openSmallDialog(UpdateStatusFormDialogComponent, {data: dialogInput}).afterClosed().subscribe(
      newExp => this.onUpdateDialogClosed(newExp)
    );
  }

  openStatusHistory(): void {
    const dialogInput: StatusHistoryListDialogInput = {
      statusHistoriesObs: this.studyService.getStatusHistories(this.study.id),
    };
    this.dialogService.openSmallDialog(StatusHistoryListDialogComponent, {data: dialogInput});
  }

}

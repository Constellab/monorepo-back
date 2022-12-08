import {Component, OnInit} from '@angular/core';
import {FlDialogService, FlFileHelper, FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabLogInfo} from '../../../model/entities/lab-log.entity';
import {
  LabLogCompleteInfoDialogComponent,
  LabLogCompleteInfoDialogInput
} from '../lab-log-complete-info-dialog/lab-log-complete-info-dialog.component';
import {LabLogService} from '../../../entity-service/lab-log.service';

@Component({
  selector: 'lab-log-table',
  templateUrl: './lab-log-table.component.html',
  styleUrls: ['./lab-log-table.component.scss']
})
export class LabLogTableComponent extends FlTableAbstractDirective<LabLogInfo>
  implements OnInit {

  constructor(private dialogService: FlDialogService,
              private logService: LabLogService) {
    super(['name', 'fileSize', 'actions']);
  }

  ngOnInit(): void {
  }

  public openCompleteLog(log: LabLogInfo): void {
    const input: LabLogCompleteInfoDialogInput = {
      logName: log.name
    };
    this.dialogService.openBigDialog(
      LabLogCompleteInfoDialogComponent, {data: input});
  }

  public downloadLog(log: LabLogInfo): void {
    const downloadUrl = this.logService.getDownloadUrl(log.name);
    FlFileHelper.downloadUrl(downloadUrl);
  }

}

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LabInstance} from '../../../core/model/entities/lab-instance.class';
import {DialogService} from '../../../core/service/dialog.service';
import {LabInstanceService} from '../../../core/service-api/lab-instance.service';
import {
  StatusHistoryListDialogComponent,
  StatusHistoryListDialogInput
} from '../../../core/module/status/status-history-list-dialog/status-history-list-dialog.component';

@Component({
  selector: 'gen-lab-instance-detail',
  templateUrl: './lab-instance-detail.component.html',
  styleUrls: ['./lab-instance-detail.component.scss']
})
export class LabInstanceDetailComponent implements OnInit {

  @Input() labInstance: LabInstance;
  @Output() update: EventEmitter<LabInstance> = new EventEmitter<LabInstance>();

  constructor(private dialogService: DialogService,
              private labInstanceService: LabInstanceService) {
  }

  ngOnInit(): void {
  }

  openStatusHistoryDialog(): void {
    const dialogInput: StatusHistoryListDialogInput = {
      statusHistoriesObs: this.labInstanceService.getStatusHistories(this.labInstance.id),
    };
    this.dialogService.openSmallDialog(StatusHistoryListDialogComponent, {data: dialogInput});
  }

  onLabUpdate(labInstance: LabInstance): void {
    this.update.emit(labInstance);
  }

}

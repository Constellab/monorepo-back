import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaLabInstance} from '../../../ca-core/model/entities/ca-lab-instance.class';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {
  CaStatusHistoryListDialogComponent,
  StatusHistoryListDialogInput
} from '../../../ca-core/module/ca-status/ca-status-history-list-dialog/ca-status-history-list-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  CaLabInstanceUpdateNameDialogComponent,
  LabInstanceUpdateNameDialogInput
} from '../ca-lab-instance-update-name-dialog/ca-lab-instance-update-name-dialog.component';

@Component({
  selector: 'ca-lab-instance-detail',
  templateUrl: './ca-lab-instance-detail.component.html',
  styleUrls: ['./ca-lab-instance-detail.component.scss']
})
export class CaLabInstanceDetailComponent implements OnInit {

  @Input() labInstance: CaLabInstance;
  @Output() update: EventEmitter<CaLabInstance> = new EventEmitter<CaLabInstance>();

  constructor(private dialogService: FlDialogService,
              private labInstanceService: CaLabInstanceService) {
  }

  ngOnInit(): void {
  }

  openStatusHistoryDialog(): void {
    const dialogInput: StatusHistoryListDialogInput = {
      statusHistoriesObs: this.labInstanceService.getStatusHistories(this.labInstance.id),
    };
    this.dialogService.openSmallDialog(CaStatusHistoryListDialogComponent, {data: dialogInput});
  }

  onLabUpdate(labInstance: CaLabInstance): void {
    this.update.emit(labInstance);
  }

  openLabNameUpdate(): void {
    const input: LabInstanceUpdateNameDialogInput = {
      labInstanceId: this.labInstance.id,
      name: this.labInstance.name
    };
    this.dialogService.openSmallDialog(CaLabInstanceUpdateNameDialogComponent, {data: input}).afterClosed().subscribe(
      labInstance => this.onUpdateNameClosed(labInstance)
    );
  }

  private onUpdateNameClosed(labInstance?: CaLabInstance): void {
    if (labInstance) {
      this.onLabUpdate(labInstance);
    }
  }
}

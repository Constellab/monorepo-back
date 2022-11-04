import {Component, OnInit} from '@angular/core';
import {CaLabInstance} from '../../../ca-core/model/entities/ca-lab-instance.class';
import {
  CaStatusHistoryListDialogComponent,
  CaStatusHistoryListDialogInput
} from '../../../ca-core/module/ca-status/ca-status-history-list-dialog/ca-status-history-list-dialog.component';
import {
  CaLabInstanceUpdateNameDialogComponent,
  LabInstanceUpdateNameDialogInput
} from '../ca-lab-instance-update-name-dialog/ca-lab-instance-update-name-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {Observable} from 'rxjs';

/**
 * Header info about the lab instance in the detail page
 */
@Component({
  selector: 'ca-lab-instance-header',
  templateUrl: './ca-lab-instance-header.component.html',
  styleUrls: ['./ca-lab-instance-header.component.scss']
})
export class CaLabInstanceHeaderComponent implements OnInit {

  labInstance$: Observable<CaLabInstance>;

  constructor(private dialogService: FlDialogService,
              private labInstanceService: CaLabInstanceService,
              private state: CaLabInstanceDetailPageState) {
  }

  ngOnInit(): void {
    this.labInstance$ = this.state.getLabInstance$();
  }

  openStatusHistoryDialog(labInstance: CaLabInstance): void {
    const dialogInput: CaStatusHistoryListDialogInput = {
      statusHistoriesObs: this.labInstanceService.getStatusHistories(labInstance.id),
    };
    this.dialogService.openSmallDialog(CaStatusHistoryListDialogComponent, {data: dialogInput});
  }

  openLabNameUpdate(labInstance: CaLabInstance): void {
    const input: LabInstanceUpdateNameDialogInput = {
      labInstanceId: labInstance.id,
      name: labInstance.name
    };
    this.dialogService.openSmallDialog(CaLabInstanceUpdateNameDialogComponent, {data: input}).afterClosed().subscribe(
      labInstance => this.onUpdateNameClosed(labInstance)
    );
  }

  private onUpdateNameClosed(labInstance?: CaLabInstance): void {
    if (labInstance) {
      this.state.updateLab(labInstance);
    }
  }

}

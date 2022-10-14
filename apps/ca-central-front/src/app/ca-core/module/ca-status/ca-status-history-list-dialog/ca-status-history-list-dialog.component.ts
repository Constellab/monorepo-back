import {Component, Inject, OnInit} from '@angular/core';
import {CaStatusHistory} from '../../../model/entities/ca-status-history.class';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FlArrayObs} from '@monorepo/front-core-lib';

export interface CaStatusHistoryListDialogInput {
  statusHistoriesObs: FlArrayObs<CaStatusHistory<any>>;
}

/**
 * Dialog to get and display the list of status history for an entity
 */
@Component({
  selector: 'ca-status-history-list-dialog',
  templateUrl: './ca-status-history-list-dialog.component.html',
  styleUrls: ['./ca-status-history-list-dialog.component.scss']
})
export class CaStatusHistoryListDialogComponent implements OnInit {

  statusHistories: FlArrayObs<CaStatusHistory<any>>;

  constructor(@Inject(MAT_DIALOG_DATA) private dialogInput: CaStatusHistoryListDialogInput) {
  }

  ngOnInit(): void {
    this.statusHistories = this.dialogInput.statusHistoriesObs;
  }

}

import {Component, Inject, OnInit} from '@angular/core';
import {StatusHistory} from '../../../model/entities/status-history.class';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FlArrayObs} from '@monorepo/front-core-lib';

export interface StatusHistoryListDialogInput {
  statusHistoriesObs: FlArrayObs<StatusHistory<any>>;
}

/**
 * Dialog to get and display the list of status history for an entity
 */
@Component({
  selector: 'gen-status-history-list-dialog',
  templateUrl: './status-history-list-dialog.component.html',
  styleUrls: ['./status-history-list-dialog.component.scss']
})
export class StatusHistoryListDialogComponent implements OnInit {

  statusHistories: FlArrayObs<StatusHistory<any>>;

  constructor(@Inject(MAT_DIALOG_DATA) private dialogInput: StatusHistoryListDialogInput) {
  }

  ngOnInit(): void {
    this.statusHistories = this.dialogInput.statusHistoriesObs;
  }

}

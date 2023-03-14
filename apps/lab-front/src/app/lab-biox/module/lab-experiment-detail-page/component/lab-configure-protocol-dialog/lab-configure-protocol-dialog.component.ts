import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface LabConfigureProtocolDialogInput {
  protocolId: string;
}

/**
 * Dialog to configure a protocol
 */
@Component({
  selector: 'lab-configure-protocol-dialog',
  templateUrl: './lab-configure-protocol-dialog.component.html',
  styleUrls: ['./lab-configure-protocol-dialog.component.scss']
})
export class LabConfigureProtocolDialogComponent implements OnInit {

  protocolId: string;

  constructor(@Inject(MAT_DIALOG_DATA) input: LabConfigureProtocolDialogInput) {
    this.protocolId = input.protocolId;
  }

  ngOnInit(): void {
  }

}

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {LabInstanceService} from '../../../../service-api/lab-instance.service';
import {Observable} from 'rxjs';

/**
 * Dialog to check the lab instance status
 */
@Component({
  selector: 'gen-lab-instance-status-dialog',
  templateUrl: './lab-instance-status-dialog.component.html',
  styleUrls: ['./lab-instance-status-dialog.component.scss']
})
export class LabInstanceStatusDialogComponent implements OnInit {

  status$: Observable<any>;

  constructor(@Inject(MAT_DIALOG_DATA) private labInstanceId: string,
              private labInstanceService: LabInstanceService) {
  }

  ngOnInit(): void {
    this.status$ = this.labInstanceService.checkStatus(this.labInstanceId);
  }

}

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {CaLabInstanceService} from '../../../../service-api/ca-lab-instance.service';
import {Observable} from 'rxjs';

/**
 * Dialog to check the lab instance status
 */
@Component({
  selector: 'ca-lab-instance-status-dialog',
  templateUrl: './ca-lab-instance-status-dialog.component.html',
  styleUrls: ['./ca-lab-instance-status-dialog.component.scss']
})
export class CaLabInstanceStatusDialogComponent implements OnInit {

  status$: Observable<any>;

  constructor(@Inject(MAT_DIALOG_DATA) private labInstanceId: string,
              private labInstanceService: CaLabInstanceService) {
  }

  ngOnInit(): void {
    this.status$ = this.labInstanceService.checkStatus(this.labInstanceId);
  }

}

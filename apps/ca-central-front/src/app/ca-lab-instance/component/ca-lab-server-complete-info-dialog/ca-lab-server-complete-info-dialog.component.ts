import {Component, Inject, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import {Observable} from 'rxjs';
import {CaServerCompleteInfo} from '../../../ca-core/model/entities/lab/ca-lab-server.class';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';

@Component({
  selector: 'ca-lab-server-complete-info-dialog',
  templateUrl: './ca-lab-server-complete-info-dialog.component.html',
  styleUrls: ['./ca-lab-server-complete-info-dialog.component.scss']
})
export class CaLabServerCompleteInfoDialogComponent implements OnInit {

  serverInfo$: Observable<CaServerCompleteInfo>
    = this.labInstanceService.getServerInfo(this.labInstanceId);

  constructor(private labInstanceService: CaLabInstanceService,
              @Inject(MAT_DIALOG_DATA) private labInstanceId: string) {
  }

  ngOnInit(): void {
  }

}

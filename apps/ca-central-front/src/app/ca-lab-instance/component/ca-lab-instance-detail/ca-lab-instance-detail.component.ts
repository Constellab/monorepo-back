import {Component, OnInit} from '@angular/core';
import {CaLabInstance} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  CaLabInstanceCodelabInfoComponent
} from '../ca-lab-instance-codelab-info/ca-lab-instance-codelab-info.component';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {Observable} from 'rxjs';
import {
  CaLabConfigDialogComponent,
  CaLabConfigDialogInput
} from '../../../ca-core/entity-module/ca-lab-core/component/ca-lab-config-dialog/ca-lab-config-dialog.component';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {
  CaLabOnPremiseDownloadConfigComponent,
  CaLabOnPremiseDownloadConfigInput
} from '../ca-lab-on-premise-download-config/ca-lab-on-premise-download-config.component';

@Component({
  selector: 'ca-lab-instance-detail',
  templateUrl: './ca-lab-instance-detail.component.html',
  styleUrls: ['./ca-lab-instance-detail.component.scss']
})
export class CaLabInstanceDetailComponent implements OnInit {

  labInstance$: Observable<CaLabInstance>;
  isOwner$: Observable<boolean> = this.state.isLabOwner$();
  isLoading: boolean = false;

  constructor(private state: CaLabInstanceDetailPageState,
              private dialogService: FlDialogService,
              private labInstanceService: CaLabInstanceService) {
  }

  ngOnInit(): void {
    this.labInstance$ = this.state.getLabInstance$();
  }

  openCodelabInfo(labInstance: CaLabInstance): void {
    this.dialogService.openMediumDialog(CaLabInstanceCodelabInfoComponent, {data: labInstance});
  }

  openLabConfig(labInstance: CaLabInstance): void {
    const input: CaLabConfigDialogInput = this.labInstanceService.getConfig(labInstance.id);

    this.dialogService.openSmallDialog(CaLabConfigDialogComponent, {data: input});
  }

  getOnPremiseConfigDownloadUrl(labInstance: CaLabInstance): void {
    const input: CaLabOnPremiseDownloadConfigInput = {
      labInstanceId: labInstance.id,
    }
    this.dialogService.openSmallDialog(CaLabOnPremiseDownloadConfigComponent, {data: input});
  }

}

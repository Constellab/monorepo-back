import {Component, OnInit} from '@angular/core';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {Observable} from 'rxjs';
import {LabWorkflowNodeDetailState} from '../../state/lab-workflow-node-detail.state';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  LabConfigureProtocolDialogComponent,
  LabConfigureProtocolDialogInput
} from '../lab-configure-protocol-dialog/lab-configure-protocol-dialog.component';

/**
 * Component to show protocol configuration with button to open the protocol configuration update dialog
 */
@Component({
  selector: 'lab-protocol-config',
  templateUrl: './lab-protocol-config.component.html',
  styleUrls: ['./lab-protocol-config.component.scss'],
  providers: [FlDialogService]
})
export class LabProtocolConfigComponent implements OnInit {
  isEditable$: Observable<boolean>;

  constructor(private experimentState: LabExperimentDetailPageState,
              private nodeDetailState: LabWorkflowNodeDetailState,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.isEditable$ = this.experimentState.isEditable$();
  }

  async openConfigureProtocolDialog(): Promise<void> {
    const process = await this.nodeDetailState.getProcessPromise();

    const data: LabConfigureProtocolDialogInput = {
      protocolId: process.id,
    }

    this.dialogService.openMediumDialog(LabConfigureProtocolDialogComponent, {data: data});
  }

}

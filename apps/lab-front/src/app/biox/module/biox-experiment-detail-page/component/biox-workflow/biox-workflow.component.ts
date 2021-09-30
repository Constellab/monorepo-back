import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {WorkflowManagerState} from '../../state/workflow-manager-state';
import {BioxFlow} from '../../../../../core/model/global/biox-connection.class';
import {BioxExperimentDetailPageState} from '../../state/biox-experiment-detail-page.state';
import {BioxProtocol} from '../../../../../core/model/entities/process/biox-protocol.entity';
import {WorkflowActionState} from '../../state/workflow-action-state';


@Component({
  selector: 'gen-biox-workflow',
  templateUrl: './biox-workflow.component.html',
  styleUrls: ['./biox-workflow.component.scss']
})
export class BioxWorkflowComponent implements OnInit, OnDestroy {

  @ViewChild('workflow', {static: false}) container: ElementRef<HTMLElement>;

  flowIsLoading: boolean = false;
  error: boolean = false;

  constructor(private workflowManagerState: WorkflowManagerState,
              private actionState: WorkflowActionState,
              private experimentState: BioxExperimentDetailPageState) {
  }

  ngOnInit(): void {
    this.loadExperimentFlow();
  }


  private loadExperimentFlow(): void {
    this.flowIsLoading = true;
    this.experimentState.getFlow$().subscribe(
      flow => this.loadExperimentFlowSuccess(flow),
      () => this.onError()
    );
  }

  private loadExperimentFlowSuccess(flow: BioxFlow<BioxProtocol>): void {
    this.workflowManagerState.init(this.container.nativeElement, flow, this.experimentState.currentExperiment);
    this.actionState.listenToConnectionSelected();
    this.flowIsLoading = false;
  }


  get experimentIsUpdatable(): boolean {
    return this.experimentState.currentExperiment.isEditable();
  }


  private onError(): void {
    this.flowIsLoading = false;
    this.error = true;
  }

  ngOnDestroy(): void {
    this.workflowManagerState.clear();
  }

}

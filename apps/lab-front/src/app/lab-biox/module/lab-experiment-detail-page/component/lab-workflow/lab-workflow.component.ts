import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LabWorkflowManagerState} from '../../state/lab-workflow-manager-state';
import {LabFlow} from '../../../../../lab-core/model/global/lab-connection.class';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {LabProtocol} from '../../../../../lab-core/model/entities/process/lab-protocol.entity';
import {LabWorkflowActionState} from '../../state/lab-workflow-action-state';
import {first} from 'rxjs/operators';


@Component({
  selector: 'lab-workflow',
  templateUrl: './lab-workflow.component.html',
  styleUrls: ['./lab-workflow.component.scss']
})
export class LabWorkflowComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('workflow', {static: false}) container: ElementRef<HTMLElement>;

  flowIsLoading: boolean = true;
  error: boolean = false;

  constructor(private workflowManagerState: LabWorkflowManagerState,
              private actionState: LabWorkflowActionState,
              private experimentState: LabExperimentDetailPageState) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.loadExperimentFlow(), 0);
  }

  private loadExperimentFlow(): void {
    this.experimentState.getMainFlow$().pipe(first()).subscribe(
      flow => this.loadExperimentFlowSuccess(flow),
      () => this.onError()
    );
  }

  private loadExperimentFlowSuccess(flow: LabFlow<LabProtocol>): void {
    this.workflowManagerState.init(this.container.nativeElement, flow, this.experimentState);
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

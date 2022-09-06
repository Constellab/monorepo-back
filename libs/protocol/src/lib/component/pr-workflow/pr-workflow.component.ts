import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PrWorkflowManagerState} from '../../state/pr-workflow-manager-state';
import {PrProtocolFlow} from '../../model/pr-connection.class';
import {PrWorkflowMode} from '../../model/pr-workflow.class';
import {Observable, Subscription} from 'rxjs';
import {PrConfigEdit} from '../../model/pr-config-edit.class';
import {PrWorkflowActionState2} from '../../state/pr-workflow-external-event.state';
import {PrConfigView} from '../../model/pr-config-view.class';


@Component({
  selector: 'pr-workflow',
  templateUrl: './pr-workflow.component.html',
  styleUrls: ['./pr-workflow.component.scss']
})
export class PrWorkflowComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() flow: PrProtocolFlow;

  @Input() mode$: Observable<PrWorkflowMode>;

  @Input() viewConfig: PrConfigView;

  @Input() editConfig?: PrConfigEdit;

  @ViewChild('workflow', {static: false}) container: ElementRef<HTMLElement>;

  flowIsLoading: boolean = true;
  error: boolean = false;
  sub: Subscription;
  inputActionSub: Subscription;


  constructor(private workflowManagerState: PrWorkflowManagerState,
              private actionState2: PrWorkflowActionState2
  ) {
  }

  ngOnInit(): void {
    if (this.viewConfig == null) {
      console.error('[PrWorkflowComponent] the view config was not provided');
      return;
    }
    // TODO improve
    this.workflowManagerState.viewConfig = this.viewConfig;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.loadExperimentFlow(), 0);
  }

  private loadExperimentFlow(): void {
    this.loadExperimentFlowSuccess();

  }


  private loadExperimentFlowSuccess(): void {
    const workflow = this.workflowManagerState.init(this.container.nativeElement, this.flow, this.mode$);
    this.actionState2.init(this.editConfig, workflow);

    this.flowIsLoading = false;
  }


  ngOnDestroy(): void {
    this.workflowManagerState.clear();
    this.sub?.unsubscribe();
    this.inputActionSub?.unsubscribe();
    this.actionState2.clear();
  }
}

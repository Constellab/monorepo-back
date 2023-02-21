import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PrWorkflowManagerState} from '../../state/pr-workflow-manager-state';
import {PrWorkflow, PrWorkflowMode} from '../../model/pr-workflow.class';
import {Observable, Subscription} from 'rxjs';
import {PrConfigView} from '../../model/pr-config-view.class';


@Component({
  selector: 'pr-workflow',
  templateUrl: './pr-workflow.component.html',
  styleUrls: ['./pr-workflow.component.scss']
})
export class PrWorkflowComponent implements OnInit, AfterViewInit, OnDestroy {


  @Input() workflow: PrWorkflow;

  @Input() mode$: Observable<PrWorkflowMode>;

  @Input() viewConfig: PrConfigView;

  @ViewChild('workflow', {static: false}) container: ElementRef<HTMLElement>;

  flowIsLoading: boolean = true;
  error: boolean = false;
  sub: Subscription;
  inputActionSub: Subscription;


  constructor(private workflowManagerState: PrWorkflowManagerState) {
  }

  ngOnInit(): void {
    if (this.viewConfig == null) {
      console.error('[PrWorkflowComponent] the view config was not provided');
      return;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.loadExperimentFlow(), 0);
  }

  private loadExperimentFlow(): void {
    this.loadExperimentFlowSuccess();

  }


  private loadExperimentFlowSuccess(): void {
    this.workflowManagerState.init(this.container.nativeElement, this.workflow, this.mode$, this.viewConfig);

    this.flowIsLoading = false;
  }


  ngOnDestroy(): void {
    this.workflowManagerState.clear();
    this.sub?.unsubscribe();
    this.inputActionSub?.unsubscribe();
  }
}

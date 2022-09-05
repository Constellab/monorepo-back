import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PrWorkflowManagerState} from '../../state/pr-workflow-manager-state';
import {PrProtocol, PrProtocolData} from '../../model/pr-protocol.entity';
import {PrFlow} from '../../model/pr-connection.class';
import {PrProtocolGraphInput} from '../../model/pr-protocol-graph-input.class';
import {PrWorkflowMode} from '../../model/pr-workflow.class';
import {Observable, Subscription} from 'rxjs';
import {PrConfigEdit} from '../../model/pr-config-edit.class';
import {MatDrawer} from '@angular/material/sidenav';
import {PrWorkflowActionState} from '../../state/pr-workflow-action-state';


@Component({
  selector: 'pr-workflow',
  templateUrl: './pr-workflow.component.html',
  styleUrls: ['./pr-workflow.component.scss']
})
export class PrWorkflowComponent implements OnInit, AfterViewInit, OnDestroy {

  public static mainFlow: PrFlow<PrProtocol> = null;

  @Input()
  mainProtocolGraph: PrProtocolGraphInput;
  @Input()
  mode$: Observable<PrWorkflowMode>;
  @Input()
  config?: PrConfigEdit;

  @ViewChild('workflow', {static: false}) container: ElementRef<HTMLElement>;

  flowIsLoading: boolean = true;
  error: boolean = false;
  sub: Subscription;
  inputActionSub: Subscription;


  constructor(
    private workflowManagerState: PrWorkflowManagerState,
    private actionState: PrWorkflowActionState
  ) {
  }

  ngOnInit(): void {
    this.actionState.init();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.loadExperimentFlow(), 0);
  }

  private loadExperimentFlow(): void {
    const mainProtocol: PrProtocol = new PrProtocol();
    mainProtocol.id = 'Home'
    mainProtocol.data = new PrProtocolData(this.mainProtocolGraph, 'Test');
    PrWorkflowComponent.mainFlow = new PrFlow<PrProtocol>(mainProtocol);
    this.loadExperimentFlowSuccess(PrWorkflowComponent.mainFlow);

  }

  ngOnDestroy(): void {
    this.workflowManagerState.clear();
    this.sub?.unsubscribe();
    this.inputActionSub?.unsubscribe();
  }

  private loadExperimentFlowSuccess(flow: PrFlow<PrProtocol>): void {
    this.workflowManagerState.init(this.container.nativeElement, flow, 'edit');


    this.mode$.subscribe(mode => {
      this.workflowManagerState.workflow.setMode(mode);
      if (this.config) {
        this.config.setState(this.workflowManagerState, this.actionState);
        this.workflowManagerState.config = this.config;
      }
    });



    this.flowIsLoading = false;
  }
}

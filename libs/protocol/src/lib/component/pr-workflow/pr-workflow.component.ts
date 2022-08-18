import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PrWorkflowManagerState} from '../../state/pr-workflow-manager-state';
import {PrProtocol, PrProtocolData} from '../../model/pr-protocol.entity';
import {PrFlow} from '../../model/pr-connection.class';
import {PrProtocolGraphInput} from '../../model/pr-protocol-graph-input.class';


@Component({
  selector: 'pr-workflow',
  templateUrl: './pr-workflow.component.html',
  styleUrls: ['./pr-workflow.component.scss']
})
export class PrWorkflowComponent implements OnInit, AfterViewInit, OnDestroy {

  public static mainFlow: PrFlow<PrProtocol> = null;

  @ViewChild('workflow', {static: false}) container: ElementRef<HTMLElement>;

  flowIsLoading: boolean = true;
  error: boolean = false;

  @Input()
  mainProtocolGraph: PrProtocolGraphInput;

  constructor(
    private workflowManagerState: PrWorkflowManagerState,
  ) {
  }

  ngOnInit(): void {
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

  private loadExperimentFlowSuccess(flow: PrFlow<PrProtocol>): void {
    this.workflowManagerState.init(this.container.nativeElement, flow, 'report');
    this.flowIsLoading = false;
  }

  ngOnDestroy(): void {
    this.workflowManagerState.clear();
  }
}

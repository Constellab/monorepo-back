import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {PrWorkflowManagerState} from '../../state/pr-workflow-manager-state';
import {PrProtocol, PrProtocolData} from '../../model/pr-protocol.entity';
import {PrFlow} from '../../model/pr-connection.class';
import {PrProtocolGraphInput} from '../../model/pr-protocol-graph-input.class';
import {PrWorkflowEvent, PrWorkflowMode} from '../../model/pr-workflow.class';
import {Subscription} from 'rxjs';
import {PrConfigEdit} from '../../model/pr-config-event.class';


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

  @Input()
  mode: PrWorkflowMode;

  @Output()
  action = new EventEmitter<PrWorkflowEvent>();

  @Input()
  configEvent?: PrConfigEdit;

  sub: Subscription;
  inputActionSub: Subscription;


  constructor(
    private workflowManagerState: PrWorkflowManagerState,
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.loadExperimentFlow(), 0);

    if (this.mode === 'report') {
      this.container.nativeElement.addEventListener('contextmenu', (event) => {
        event.stopImmediatePropagation()
      }, true);

      this.container.nativeElement.addEventListener('keydown', (event) => {
        event.stopImmediatePropagation()
      }, true);
    }
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
    this.workflowManagerState.init(this.container.nativeElement, flow, this.mode);

    if (this.mode === 'edit' && this.configEvent) {
      this.configEvent.setState(this.workflowManagerState);
    }

    this.flowIsLoading = false;
  }
}

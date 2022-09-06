import {Component, Input, OnInit} from '@angular/core';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {BehaviorSubject, Observable} from 'rxjs';
import {LabProcess} from '../../../../../lab-core/model/entities/process/lab-process.entity';
import {filter, map} from 'rxjs/operators';
import {LabProtocol} from '../../../../../lab-core/model/entities/process/lab-protocol.entity';

/**
 * Component to configure a protocol, can contains nested protocol
 */
@Component({
  selector: 'lab-configure-protocol',
  templateUrl: './lab-configure-protocol.component.html',
  styleUrls: ['./lab-configure-protocol.component.scss']
})
export class LabConfigureProtocolComponent implements OnInit {

  @Input() protocolId: string;

  selectedProcess$: Observable<LabProcess>;

  private selectedProcessSubject: BehaviorSubject<LabProcess> = new BehaviorSubject(null);

  processes$: Observable<LabProcess[]>;

  constructor(private experimentState: LabExperimentDetailPageState) {
  }

  ngOnInit(): void {
    this.processes$ = this.experimentState.getProtocol(this.protocolId).pipe(
      map(flow => this.getConfigurableNodes(flow))
    );
    this.selectedProcess$ = this.selectedProcessSubject.asObservable().pipe(filter(process => process != null));
  }

  private getConfigurableNodes(protocol: LabProtocol): LabProcess[] {
    const nodes = protocol.getNodes();
    return Object.values(nodes).filter(node => node.hasConfig() || node.isProtocol);
  }

  selectProcess(process: LabProcess): void {
    if (this.selectedProcessSubject.value?.id === process.id) return;
    this.selectedProcessSubject.next(process);
  }
}

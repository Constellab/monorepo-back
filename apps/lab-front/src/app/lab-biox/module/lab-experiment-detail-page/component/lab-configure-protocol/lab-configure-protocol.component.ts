import {Component, Input, OnInit} from '@angular/core';
import {LabExperimentDetailPageState} from '../../state/lab-experiment-detail-page.state';
import {BehaviorSubject, Observable} from 'rxjs';
import {LabProcess} from '../../../../../lab-core/model/entities/process/lab-process.entity';
import {filter, map} from 'rxjs/operators';

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
    this.processes$ = this.experimentState.getOrLoadLayer$(this.protocolId).pipe(
      map(layer => layer.getProcessNodes().map(node => node.currentObject) as LabProcess[])
    );

    this.selectedProcess$ = this.selectedProcessSubject.asObservable().pipe(filter(process => process != null));
  }


  selectProcess(process: LabProcess): void {
    if (this.selectedProcessSubject.value?.id === process.id) return;
    this.selectedProcessSubject.next(process);
  }
}

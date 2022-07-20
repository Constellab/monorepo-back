import {Component, OnInit} from '@angular/core';
import {
  FlBioNetworkSimulationProgressEvent,
  FlBioNetworkSimulationState
} from '../../state/fl-bio-network-simulation.state';
import {Observable} from 'rxjs';

@Component({
  selector: 'fl-bio-network-engine-progress',
  templateUrl: './fl-bio-network-engine-progress.component.html',
  styleUrls: ['./fl-bio-network-engine-progress.component.scss']
})
export class FlBioNetworkEngineProgressComponent implements OnInit {

  progress$: Observable<FlBioNetworkSimulationProgressEvent>;

  constructor(private simulationState: FlBioNetworkSimulationState) {
  }

  ngOnInit(): void {
    this.progress$ = this.simulationState.getProgress$();
  }

}

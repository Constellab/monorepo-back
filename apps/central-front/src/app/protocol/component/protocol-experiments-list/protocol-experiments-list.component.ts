import {Component, Input, OnInit} from '@angular/core';
import {Experiment} from '../../../core/model/entities/experiment.class';
import {ExperimentService} from '../../../dashboard/service/experiment.service';
import {ArrayObs} from '../../../core/model/datasource/array-obs.class';

/**
 * Show the list of user's experiments that uses a protocol
 */
@Component({
  selector: 'gen-protocol-experiments-list',
  templateUrl: './protocol-experiments-list.component.html',
  styleUrls: ['./protocol-experiments-list.component.scss']
})
export class ProtocolExperimentsListComponent implements OnInit {

  @Input() protocolId: string;

  experimentsArray: ArrayObs<Experiment>;

  constructor(private experimentService: ExperimentService) {
  }

  ngOnInit(): void {
    this.experimentsArray = this.experimentService.getExperimentsByProtocol(this.protocolId);
  }

}

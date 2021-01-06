import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Experiment} from '../../../../../core/model/entities/experiment.class';
import {LabIframeOptions, RouterService} from '../../../../../core/service/router.service';

/**
 * Simple card for on experiment
 */
@Component({
  selector: 'gen-experiment-card',
  templateUrl: './experiment-card.component.html',
  styleUrls: ['./experiment-card.component.scss']
})
export class ExperimentCardComponent implements OnInit {

  @Input() experiment: Experiment;

  @Output() update: EventEmitter<Experiment> = new EventEmitter<Experiment>();

  openInLabLink: string;
  linkQueryParams: LabIframeOptions;

  constructor() {
  }

  ngOnInit(): void {
    if (this.experiment.labInstance.isRunning() && !this.experiment.statusIsDraft()) {
      this.openInLabLink = RouterService.getLabIframeRoute(this.experiment.labInstance.id);
      this.linkQueryParams = {objectType: 'experiment', objectId: this.experiment.id};
    }
  }
}

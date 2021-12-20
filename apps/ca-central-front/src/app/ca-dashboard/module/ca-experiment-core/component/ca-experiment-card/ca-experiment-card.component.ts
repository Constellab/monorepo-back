import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Experiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaLabIframeOptions, CaRouterService} from '../../../../../ca-core/service/ca-router.service';

/**
 * Simple card for on experiment
 */
@Component({
  selector: 'ca-experiment-card',
  templateUrl: './ca-experiment-card.component.html',
  styleUrls: ['./ca-experiment-card.component.scss']
})
export class CaExperimentCardComponent implements OnInit {

  @Input() experiment: Experiment;

  @Output() update: EventEmitter<Experiment> = new EventEmitter<Experiment>();

  openInLabLink: string;
  linkQueryParams: CaLabIframeOptions;

  constructor() {
  }

  ngOnInit(): void {
    if (this.experiment.labInstance.isRunning() && !this.experiment.statusIsDraft()) {
      this.openInLabLink = CaRouterService.getLabIframeRoute(this.experiment.labInstance.id);
      this.linkQueryParams = {objectType: 'experiment', objectId: this.experiment.id};
    }
  }
}

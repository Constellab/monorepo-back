import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaExperiment} from '../../../../../ca-core/model/entities/project/ca-experiment.class';

/**
 * Detail card of the experiment used in the experiment page
 */
@Component({
  selector: 'ca-experiment-card-detail',
  templateUrl: './ca-experiment-card-detail.component.html',
  styleUrls: ['./ca-experiment-card-detail.component.scss']
})
export class CaExperimentCardDetailComponent implements OnInit {

  @Input() experiment: CaExperiment;
  @Output() update: EventEmitter<CaExperiment> = new EventEmitter<CaExperiment>();

  experimentRoute: string;

  constructor() {
  }

  ngOnInit(): void {
    if (this.experiment.labInstance.isRunning()) {
      this.experimentRoute =
        `${this.experiment.labInstance.frontUrl}/app/biox/experiment/${this.experiment.id}`;
    }
  }
}

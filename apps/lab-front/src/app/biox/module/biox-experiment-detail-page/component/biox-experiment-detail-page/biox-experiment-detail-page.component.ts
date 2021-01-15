import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {LabExperiment} from '../../../../../core/model/entities/lab-experiment.entity';
import {LabExperimentService} from '../../../../../core/entity-service/lab-experiment.service';

/**
 * Page for the biox experiment detail with workflow view/edit
 */
@Component({
  selector: 'gen-biox-experiment-detail-page',
  templateUrl: './biox-experiment-detail-page.component.html',
  styleUrls: ['./biox-experiment-detail-page.component.css']
})
export class BioxExperimentDetailPageComponent implements OnInit {

  getExperiment: Observable<LabExperiment>;

  constructor(private route: ActivatedRoute,
              private labExperimentService: LabExperimentService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.id)
    );
  }

  private init(experimentId: string): void {
    this.getExperiment = this.labExperimentService.getExperiment(experimentId);
  }


}

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {BioxExperiment} from '../../../../../core/model/entities/biox-experiment.entity';
import {BioxExperimentService} from '../../../../../core/entity-service/biox-experiment.service';

/**
 * Page for the biox experiment detail with workflow view/edit
 */
@Component({
  selector: 'gen-biox-experiment-detail-page',
  templateUrl: './biox-experiment-detail-page.component.html',
  styleUrls: ['./biox-experiment-detail-page.component.css']
})
export class BioxExperimentDetailPageComponent implements OnInit {

  getExperiment: Observable<BioxExperiment>;

  constructor(private route: ActivatedRoute,
              private bioxExperimentService: BioxExperimentService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.id)
    );
  }

  private init(experimentId: string): void {
    this.getExperiment = this.bioxExperimentService.getExperiment(experimentId);
  }


}

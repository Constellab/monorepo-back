import {Component, Input, OnInit} from '@angular/core';
import {Experiment} from '../../../../../core/model/entities/experiment.class';
import {ExperimentService} from '../../../../service/experiment.service';
import {
  ExperimentFormDialogComponent,
  ExperimentFormDialogInput
} from '../../../experiment-core/component/experiment-form-dialog/experiment-form-dialog.component';
import {ActivatedRoute, Router} from '@angular/router';
import {FlArrayObs, FlDialogService} from '@monorepo/front-core-lib';

/**
 * In the study detail page, show the list of experiences
 */
@Component({
  selector: 'gen-experiments-list',
  templateUrl: './experiments-list.component.html',
  styleUrls: ['./experiments-list.component.scss']
})
export class ExperimentsListComponent implements OnInit {

  @Input() studyId: string;

  experimentsArray: FlArrayObs<Experiment>;


  constructor(private experimentService: ExperimentService,
              private dialogService: FlDialogService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.experimentsArray = this.experimentService.getExperimentsOfStudy(this.studyId);
  }


  openCreateExperimentDialog(): void {
    const dialogInput: ExperimentFormDialogInput = {
      mode: 'create',
      studyId: this.studyId
    };
    this.dialogService.openSmallDialog(ExperimentFormDialogComponent, {data: dialogInput})
      .afterClosed().subscribe(
      experiment => this.onCreateExperimentClosed(experiment)
    );
  }

  private onCreateExperimentClosed(experiment?: Experiment): void {
    if (experiment) {
      this.experimentsArray.unshiftItem(experiment);
      this.router.navigate(['experiment', experiment.id], {relativeTo: this.route});
    }
  }
}

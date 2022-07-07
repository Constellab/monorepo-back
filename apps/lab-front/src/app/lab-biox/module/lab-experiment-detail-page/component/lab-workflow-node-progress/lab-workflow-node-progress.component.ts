import {Component, Input, OnInit} from '@angular/core';
import {LabProcess} from '../../../../../lab-core/model/entities/process/lab-process.entity';
import {Observable} from 'rxjs';
import {FlDialogService} from '@monorepo/front-core-lib';
import {LabProgressBar} from '../../../../../lab-core/model/entities/lab-progress-bar.entity';
import {map} from 'rxjs/operators';
import {
  LabProgressBarInfoDialogComponent
} from '../lab-progress-bar-info-dialog/lab-progress-bar-info-dialog.component';

@Component({
  selector: 'lab-workflow-node-progress',
  templateUrl: './lab-workflow-node-progress.component.html',
  styleUrls: ['./lab-workflow-node-progress.component.scss']
})
export class LabWorkflowNodeProgressComponent implements OnInit {

  @Input() process$: Observable<LabProcess>;

  constructor(private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }

  openProgressDetails(): void {
    const progressBar$: Observable<LabProgressBar> = this.process$.pipe(
      map(process => process.progressBar)
    );

    this.dialogService.openMediumDialog(LabProgressBarInfoDialogComponent, {data: progressBar$});
  }

}

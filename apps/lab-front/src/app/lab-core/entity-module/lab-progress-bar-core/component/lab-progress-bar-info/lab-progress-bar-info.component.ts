import {Component, Input, OnInit} from '@angular/core';
import {LabProgressBar} from '../../../../model/entities/lab-progress-bar.entity';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * Show information about a {@link LabProgressBar}
 */
@Component({
  selector: 'lab-progress-bar-info',
  templateUrl: './lab-progress-bar-info.component.html',
  styleUrls: ['./lab-progress-bar-info.component.scss']
})
export class LabProgressBarInfoComponent implements OnInit {

  @Input() progressBar$: Observable<LabProgressBar>;

  elapsedTime$: Observable<number>;

  constructor() {
  }

  ngOnInit(): void {
    this.elapsedTime$ = this.progressBar$.pipe(
      map(progressBar => progressBar.elapsedTime)
    );
  }

}

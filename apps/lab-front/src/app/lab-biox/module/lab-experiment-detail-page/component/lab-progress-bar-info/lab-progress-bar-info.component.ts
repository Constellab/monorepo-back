import {Component, Input, OnInit} from '@angular/core';
import {LabProgressBar} from '../../../../../lab-core/model/entities/lab-progress-bar.entity';

/**
 * Show information about a {@link LabProgressBar}
 */
@Component({
  selector: 'lab-progress-bar-info',
  templateUrl: './lab-progress-bar-info.component.html',
  styleUrls: ['./lab-progress-bar-info.component.scss']
})
export class LabProgressBarInfoComponent implements OnInit {

  @Input() progressBar: LabProgressBar;

  constructor() {
  }

  ngOnInit(): void {
  }

}

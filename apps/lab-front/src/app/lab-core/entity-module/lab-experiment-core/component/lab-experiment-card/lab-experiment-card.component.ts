import {Component, Input, OnInit} from '@angular/core';
import {LabExperiment} from '../../../../model/entities/lab-experiment.entity';

@Component({
  selector: 'lab-experiment-card',
  templateUrl: './lab-experiment-card.component.html',
  styleUrls: ['./lab-experiment-card.component.scss']
})
export class LabExperimentCardComponent implements OnInit {

  @Input() experiment: LabExperiment;

  showDetail: boolean = true;

  constructor() {
  }

  ngOnInit(): void {
  }

  toggleDetail(): void {
    this.showDetail = !this.showDetail;
  }

  get expandIcon(): string {
    return this.showDetail ? 'expand_less': 'expand_more';
  }
}

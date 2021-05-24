import {Component, Input, OnInit} from '@angular/core';
import {BioxProgressBar} from '../../../../../core/model/entities/biox-progress-bar.entity';

@Component({
  selector: 'gen-biox-workflow-node-progress',
  templateUrl: './biox-workflow-node-progress.component.html',
  styleUrls: ['./biox-workflow-node-progress.component.scss']
})
export class BioxWorkflowNodeProgressComponent implements OnInit {

  @Input() progressBar: BioxProgressBar;

  constructor() {
  }

  ngOnInit(): void {
  }

}

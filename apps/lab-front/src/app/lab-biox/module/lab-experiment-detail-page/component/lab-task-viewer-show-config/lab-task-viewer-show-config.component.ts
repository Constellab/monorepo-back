import {Component, Input, OnInit} from '@angular/core';
import {LabTaskViewerConfig} from '../../../../../lab-core/model/entities/lab-typing-name.class';

/**
 * Component to show the configuration of the viewer
 */
@Component({
  selector: 'lab-task-viewer-show-config',
  templateUrl: './lab-task-viewer-show-config.component.html',
  styleUrls: ['./lab-task-viewer-show-config.component.scss']
})
export class LabTaskViewerShowConfigComponent implements OnInit {

  @Input() config: LabTaskViewerConfig;

  constructor() {
  }

  ngOnInit(): void {
  }

}


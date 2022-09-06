import {Component, Input, OnInit} from '@angular/core';
import {TdTaskViewerConfig} from '@monorepo/technical-doc';

/**
 * Component to show the configuration of the viewer
 */
@Component({
  selector: 'lab-task-viewer-show-config',
  templateUrl: './lab-task-viewer-show-config.component.html',
  styleUrls: ['./lab-task-viewer-show-config.component.scss']
})
export class LabTaskViewerShowConfigComponent implements OnInit {

  @Input() config: TdTaskViewerConfig;

  constructor() {
  }

  ngOnInit(): void {
  }

}


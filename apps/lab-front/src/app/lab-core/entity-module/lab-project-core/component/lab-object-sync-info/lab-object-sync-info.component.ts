import {Component, Input, OnInit} from '@angular/core';
import {LabProjectObject} from '../../../../model/entities/lab-project.class';

/**
 * Component to show information about the sync of a project object
 */
@Component({
  selector: 'lab-object-sync-info',
  templateUrl: './lab-object-sync-info.component.html',
  styleUrls: ['./lab-object-sync-info.component.scss']
})
export class LabObjectSyncInfoComponent implements OnInit {

  @Input() object: LabProjectObject;

  constructor() {
  }

  ngOnInit(): void {
  }

}

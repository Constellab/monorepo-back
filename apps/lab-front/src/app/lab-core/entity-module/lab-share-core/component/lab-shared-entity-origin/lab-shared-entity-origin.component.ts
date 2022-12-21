import {Component, Input, OnInit} from '@angular/core';
import {LabSharedEntity} from '../../../../model/entities/lab-share.entity';


/**
 * Component to show the origin of a shared resource.
 */
@Component({
  selector: 'lab-shared-entity-origin',
  templateUrl: './lab-shared-entity-origin.component.html',
  styleUrls: ['./lab-shared-entity-origin.component.scss']
})
export class LabSharedEntityOriginComponent implements OnInit {

  @Input() sharedEntity: LabSharedEntity;

  constructor() {
  }

  ngOnInit(): void {
  }

}

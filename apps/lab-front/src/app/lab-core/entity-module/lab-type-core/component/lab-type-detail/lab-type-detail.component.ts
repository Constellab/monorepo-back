import {Component, Input, OnInit} from '@angular/core';
import {LabTypeEntity} from '../../../../model/entities/lab-type/lab-type.entity';

/**
 * Component to show the detail of a type (resource, task or protocol)
 */
@Component({
  selector: 'lab-process-type-detail',
  templateUrl: './lab-type-detail.component.html',
  styleUrls: ['./lab-type-detail.component.scss'],
})
export class LabTypeDetailComponent implements OnInit {

  @Input() type: LabTypeEntity;

  constructor() {
  }

  ngOnInit(): void {
  }
}

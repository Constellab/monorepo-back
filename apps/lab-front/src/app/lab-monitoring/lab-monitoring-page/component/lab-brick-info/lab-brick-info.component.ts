import {Component, Input, OnInit} from '@angular/core';
import {LabBrickEntity} from '../../../../lab-core/model/entities/lab-brick.entity';

/**
 * Show information and messages about a brick
 */
@Component({
  selector: 'lab-brick-info',
  templateUrl: './lab-brick-info.component.html',
  styleUrls: ['./lab-brick-info.component.scss']
})
export class LabBrickInfoComponent implements OnInit {

  @Input() brick: LabBrickEntity;

  constructor() {
  }

  ngOnInit(): void {
  }

}

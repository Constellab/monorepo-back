import {Component, Input, OnInit} from '@angular/core';
import {LabBrickMessage} from '../../../../lab-core/model/entities/lab-brick.entity';

/**
 * Component to display the messages of a brick
 */
@Component({
  selector: 'lab-brick-message-list',
  templateUrl: './lab-brick-message-list.component.html',
  styleUrls: ['./lab-brick-message-list.component.scss']
})
export class LabBrickMessageListComponent implements OnInit {

  @Input() messages: LabBrickMessage[];

  constructor() { }

  ngOnInit(): void {
  }

}

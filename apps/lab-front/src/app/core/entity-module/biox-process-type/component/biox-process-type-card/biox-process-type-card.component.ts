import {Component, Input, OnInit} from '@angular/core';
import {BioxProcessType} from '../../../../model/entities/biox-process-type.entity';

/**
 * Card showing process type information with an ng-content for card actions
 */
@Component({
  selector: 'gen-biox-process-type-card',
  templateUrl: './biox-process-type-card.component.html',
  styleUrls: ['./biox-process-type-card.component.scss']
})
export class BioxProcessTypeCardComponent implements OnInit {

  @Input() processType: BioxProcessType;

  constructor() { }

  ngOnInit(): void {
  }

}

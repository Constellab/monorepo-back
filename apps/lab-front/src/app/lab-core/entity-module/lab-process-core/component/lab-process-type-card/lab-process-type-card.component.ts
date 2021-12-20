import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {LabProcessType} from '../../../../model/entities/lab-type/lab-process-type.entity';

/**
 * Card showing process type information with an ng-content for card actions
 */
@Component({
  selector: 'lab-process-type-card',
  templateUrl: './lab-process-type-card.component.html',
  styleUrls: ['./lab-process-type-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabProcessTypeCardComponent implements OnInit {

  @Input() processType: LabProcessType;

  constructor() {
  }

  ngOnInit(): void {
  }
}

import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {BioxProcessableType} from '../../../../model/entities/lab-type/biox-processable-type.entity';

/**
 * Card showing process type information with an ng-content for card actions
 */
@Component({
  selector: 'gen-biox-processable-type-card',
  templateUrl: './biox-processable-type-card.component.html',
  styleUrls: ['./biox-processable-type-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BioxProcessableTypeCardComponent implements OnInit {

  @Input() processableType: BioxProcessableType;

  constructor() {
  }

  ngOnInit(): void {
  }
}

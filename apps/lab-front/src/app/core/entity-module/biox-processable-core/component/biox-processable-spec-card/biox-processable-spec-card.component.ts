import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {BioxProcessableSpec} from '../../../../model/entities/processable-spec/biox-processable-spec.entity';

/**
 * Card showing process type information with an ng-content for card actions
 */
@Component({
  selector: 'gen-biox-processable-spec-card',
  templateUrl: './biox-processable-spec-card.component.html',
  styleUrls: ['./biox-processable-spec-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BioxProcessableSpecCardComponent implements OnInit {

  @Input() processableSpec: BioxProcessableSpec;

  constructor() {
  }

  ngOnInit(): void {
  }

  get title(): string {
    return this.processableSpec.data.title ?? this.processableSpec.modelType;
  }

}

import {Component, Input, OnInit} from '@angular/core';
import {BioxProcessType} from '../../../../model/entities/biox-process-type.entity';

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

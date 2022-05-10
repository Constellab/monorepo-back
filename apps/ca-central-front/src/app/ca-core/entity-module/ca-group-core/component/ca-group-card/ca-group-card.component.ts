import {Component, Input, OnInit} from '@angular/core';
import {CaGroup} from '../../../../model/entities/ca-group.entity';

@Component({
  selector: 'ca-group-card',
  templateUrl: './ca-group-card.component.html',
  styleUrls: ['./ca-group-card.component.scss']
})
export class CaGroupCardComponent implements OnInit {

  @Input() group: CaGroup;

  constructor() {
  }

  ngOnInit(): void {
  }

}

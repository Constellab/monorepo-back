import {Component, Input, OnInit} from '@angular/core';
import {CaGroup} from '../../../../model/entities/ca-group.entity';

@Component({
  selector: 'ca-groups-list',
  templateUrl: './ca-groups-list.component.html',
  styleUrls: ['./ca-groups-list.component.scss']
})
export class CaGroupsListComponent implements OnInit {

  @Input() groups: CaGroup[];

  constructor() {
  }

  ngOnInit(): void {
  }

}

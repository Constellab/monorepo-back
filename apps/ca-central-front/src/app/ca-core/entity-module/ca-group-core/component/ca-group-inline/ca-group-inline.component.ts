import {Component, Input, OnInit} from '@angular/core';
import {CaGroup} from '../../../../model/entities/ca-group.entity';

/**
 * Component to show the type of group along with label
 */
@Component({
  selector: 'ca-group-inline',
  templateUrl: './ca-group-inline.component.html',
  styleUrls: ['./ca-group-inline.component.scss']
})
export class CaGroupInlineComponent implements OnInit {

  @Input() group: CaGroup;

  @Input() disableLink: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

}

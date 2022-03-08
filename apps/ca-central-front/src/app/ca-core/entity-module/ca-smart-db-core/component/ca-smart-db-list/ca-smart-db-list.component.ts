import {Component, Input, OnInit} from '@angular/core';
import {CaSmartDb} from '../../../../model/entities/ca-smart-db.entity';

/**
 * list of smartdb card with link
 */
@Component({
  selector: 'ca-smart-db-list',
  templateUrl: './ca-smart-db-list.component.html',
  styleUrls: ['./ca-smart-db-list.component.scss']
})
export class CaSmartDbListComponent implements OnInit {

  @Input() smartDbs: CaSmartDb[];

  constructor() {
  }

  ngOnInit(): void {
  }

}

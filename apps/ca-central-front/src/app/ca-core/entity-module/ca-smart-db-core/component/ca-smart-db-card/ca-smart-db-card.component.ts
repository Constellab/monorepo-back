import {Component, Input, OnInit} from '@angular/core';
import {CaSmartDb} from '../../../../model/entities/ca-smart-db.entity';

/**
 * Card for {@link CaSmartDb}
 */
@Component({
  selector: 'ca-smart-db-card',
  templateUrl: './ca-smart-db-card.component.html',
  styleUrls: ['./ca-smart-db-card.component.scss']
})
export class CaSmartDbCardComponent implements OnInit {

  @Input() smartDb: CaSmartDb;

  constructor() {
  }

  ngOnInit(): void {
  }

}

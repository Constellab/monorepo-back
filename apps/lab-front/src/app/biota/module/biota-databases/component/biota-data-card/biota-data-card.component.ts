import {Component, Input, OnInit} from '@angular/core';
import {BiotaData} from '../../../../model/biota-data.class';

/**
 * Simple card for biota data
 */
@Component({
  selector: 'gen-biota-data-card',
  templateUrl: './biota-data-card.component.html',
  styleUrls: ['./biota-data-card.component.scss']
})
export class BiotaDataCardComponent implements OnInit {

  @Input() biotaData: BiotaData;

  constructor() {
  }

  ngOnInit(): void {
  }

}

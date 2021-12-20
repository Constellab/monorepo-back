import {Component, Input, OnInit} from '@angular/core';
import {LabBiotaData} from '../../../../model/lab-biota-data.class';

/**
 * Simple card for biota data
 */
@Component({
  selector: 'lab-biota-data-card',
  templateUrl: './biota-data-card.component.html',
  styleUrls: ['./biota-data-card.component.scss']
})
export class BiotaDataCardComponent implements OnInit {

  @Input() biotaData: LabBiotaData;

  constructor() {
  }

  ngOnInit(): void {
  }

}

import {Component, Input, OnInit} from '@angular/core';
import {LabBiotaData} from '../../../../model/lab-biota-data.class';

/**
 * Simple card for biota data
 */
@Component({
  selector: 'lab-biota-data-card',
  templateUrl: './lab-biota-data-card.component.html',
  styleUrls: ['./lab-biota-data-card.component.scss']
})
export class LabBiotaDataCardComponent implements OnInit {

  @Input() biotaData: LabBiotaData;

  constructor() {
  }

  ngOnInit(): void {
  }

}

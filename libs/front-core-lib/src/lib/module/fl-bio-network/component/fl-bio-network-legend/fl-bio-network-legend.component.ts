import {Component, OnInit} from '@angular/core';
import {flBioNetworkCofactorColor} from '@monorepo/front-core-lib';

/**
 * Component to show the legend of the bio network
 */
@Component({
  selector: 'fl-bio-network-legend',
  templateUrl: './fl-bio-network-legend.component.html',
  styleUrls: ['./fl-bio-network-legend.component.scss']
})
export class FlBioNetworkLegendComponent implements OnInit {


  cofactorColor = flBioNetworkCofactorColor;

  constructor() {
  }

  ngOnInit(): void {
  }

}

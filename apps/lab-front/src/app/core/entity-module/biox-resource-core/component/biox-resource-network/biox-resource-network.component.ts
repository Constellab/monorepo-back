import {Component, Input, OnInit} from '@angular/core';
import {FlBioNetwork} from '@monorepo/front-core-lib';
import {BioxResourceViewComponent} from '../../model/biox-resource-view-component.class';
import {BioxResourceViewNetwork} from '../../../../model/entities/resource/biox-resource-view.entity';

/**
 * Display the resource as a network pathway
 */
@Component({
  selector: 'gen-biox-resource-network',
  templateUrl: './biox-resource-network.component.html',
  styleUrls: ['./biox-resource-network.component.scss']
})
export class BioxResourceNetworkComponent implements OnInit, BioxResourceViewComponent<BioxResourceViewNetwork> {

  @Input() view: BioxResourceViewNetwork;

  networks: FlBioNetwork | FlBioNetwork[];

  error: boolean;

  constructor() {
  }

  ngOnInit(): void {
    // if (BioxResourceNetworkHelper.resourceIsNetwork(this.resource)) {
    //   this.networks = BioxResourceNetworkHelper.getNetworksFromResource(this.resource);
    //   this.error = false;
    // } else {
    //   this.error = true;
    // }
    this.networks = this.view.data;
    this.error = false;
  }
}

import {Component, Input, OnInit} from '@angular/core';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';
import {FlBioNetwork} from '@monorepo/front-core-lib';
import {BioxResourceNetworkHelper} from '../../../../model/entities/resource/biox-resource-network.helper';

/**
 * Display the resource as a network pathway
 */
@Component({
  selector: 'gen-biox-resource-network',
  templateUrl: './biox-resource-network.component.html',
  styleUrls: ['./biox-resource-network.component.scss']
})
export class BioxResourceNetworkComponent implements OnInit {

  @Input() resource: BioxResource;

  networks: FlBioNetwork | FlBioNetwork[];

  error: boolean;

  constructor() {
  }

  ngOnInit(): void {
    if (BioxResourceNetworkHelper.resourceIsNetwork(this.resource)) {
      this.networks = BioxResourceNetworkHelper.getNetworksFromResource(this.resource);
      this.error = false;
    } else {
      this.error = true;
    }

  }
}

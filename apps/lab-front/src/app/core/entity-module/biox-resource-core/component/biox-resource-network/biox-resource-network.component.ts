import {Component, Input, OnInit} from '@angular/core';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';
import {FlBioNetwork} from '@monorepo/front-core-lib';
import {BioxNetworkHelper} from '../../../../model/entities/resource/biox-network.helper';

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

  constructor() {
  }

  ngOnInit(): void {
    this.networks = BioxNetworkHelper.getNetworksFromResource(this.resource);
  }
}

import {Component, Input, OnInit} from '@angular/core';
import {BioxResource, bioxResourceNetworkType} from '../../../../model/entities/biox-resource.entity';
import {FlPathway} from '@monorepo/front-core-lib';
import {FileResource} from '../../../../model/entities/file-resource.entity';

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

  network: FlPathway;

  constructor() {
  }

  ngOnInit(): void {
    if (this.resource instanceof FileResource) {
      // if the resource is a resource file containing a network
      if (this.resource.dataIsLabEntity()) {
        this.network = this.resource.data.data.network;
      } else {
        // if the resource is a file containing directly the network json
        this.network = this.resource.data;
      }
      // if the resource is a network
    } else if (this.resource.type === bioxResourceNetworkType) {
      this.network = this.resource.data.network;
    } else {
      console.error('The resource is not a network');
    }
  }
}

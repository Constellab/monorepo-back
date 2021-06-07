import {Component, Input, OnInit} from '@angular/core';
import {BioxResource, bioxResourceNetworkType} from '../../../../model/entities/biox-resource.entity';
import {FlPathway} from '@monorepo/front-core-lib';
import {FileResourcePreview} from '../../../../model/entities/file-resource.entity';

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
    if (this.resource instanceof FileResourcePreview) {
      this.network = this.resource.data;
    } else if (this.resource.type === bioxResourceNetworkType) {
      this.network = this.resource.data.network;
    } else {
      console.error('The resource is not a network');
    }
  }

}

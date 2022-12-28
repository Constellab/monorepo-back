import {Component, Input, OnInit} from '@angular/core';
import {CaCloudProviderRegion} from '../../../../model/entities/ca-cloud-provider.class';

@Component({
  selector: 'ca-bucket-region-inline',
  templateUrl: './ca-cloud-provider-region-inline.component.html',
  styleUrls: ['./ca-cloud-provider-region-inline.component.scss']
})
export class CaCloudProviderRegionInlineComponent implements OnInit {

  @Input() region: CaCloudProviderRegion;

  constructor() {
  }

  ngOnInit(): void {
  }

}

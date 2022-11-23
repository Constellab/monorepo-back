import {Component, Input, OnInit} from '@angular/core';
import {CaCloudProvider} from '../../../../model/entities/ca-cloud-provider.class';

@Component({
  selector: 'ca-cloud-provider-inline',
  templateUrl: './ca-cloud-provider-inline.component.html',
  styleUrls: ['./ca-cloud-provider-inline.component.scss']
})
export class CaCloudProviderInlineComponent implements OnInit {

  @Input() cloudProvider: CaCloudProvider;

  constructor() { }

  ngOnInit(): void {
  }

}

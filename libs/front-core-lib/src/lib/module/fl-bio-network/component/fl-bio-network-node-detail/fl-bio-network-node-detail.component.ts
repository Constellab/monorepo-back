import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FlBioNetworkD3Node} from '../../model/fl-bio-network-d3.class';

@Component({
  selector: 'fl-bio-network-node-detail',
  templateUrl: './fl-bio-network-node-detail.component.html',
  styleUrls: ['./fl-bio-network-node-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkNodeDetailComponent implements OnInit {

  @Input() node: FlBioNetworkD3Node;

  constructor() {
  }

  ngOnInit(): void {
  }

}

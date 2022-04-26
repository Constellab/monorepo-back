import {Component, Input, OnInit} from '@angular/core';
import {FlBioNetworkMetabolite} from '../../model/fl-bio-network.class';

@Component({
  selector: 'fl-bio-network-metabolite-detail',
  templateUrl: './fl-bio-network-metabolite-detail.component.html',
  styleUrls: ['./fl-bio-network-metabolite-detail.component.scss'],
})
export class FlBioNetworkMetaboliteDetailComponent implements OnInit {

  @Input() node: FlBioNetworkMetabolite;

  constructor() {
  }

  ngOnInit(): void {
  }

}

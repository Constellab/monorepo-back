import {Component, Input, OnInit} from '@angular/core';
import {FlBioNetworkReaction} from '../../model/fl-bio-network.class';

@Component({
  selector: 'fl-bio-network-reaction-detail',
  templateUrl: './fl-bio-network-reaction-detail.component.html',
  styleUrls: ['./fl-bio-network-reaction-detail.component.scss'],
})
export class FlBioNetworkReactionDetailComponent implements OnInit {

  @Input() reaction: FlBioNetworkReaction;

  constructor() {
  }

  ngOnInit(): void {
  }
}

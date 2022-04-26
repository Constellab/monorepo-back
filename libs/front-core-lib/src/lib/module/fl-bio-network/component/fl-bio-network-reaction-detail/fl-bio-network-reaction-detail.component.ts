import {Component, Input, OnInit} from '@angular/core';
import {FlBioNetworkPathwayDetail, FlBioNetworkReaction} from '../../model/fl-bio-network.class';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {ClOnChange} from '@monorepo/core-lib';
import {FlBioNetworkHelper} from '../../utils/fl-bio-network.helper';

@Component({
  selector: 'fl-bio-network-reaction-detail',
  templateUrl: './fl-bio-network-reaction-detail.component.html',
  styleUrls: ['./fl-bio-network-reaction-detail.component.scss'],
})
export class FlBioNetworkReactionDetailComponent implements OnInit {

  @ClOnChange(function (this: FlBioNetworkReactionDetailComponent, value: FlBioNetworkReaction) {
    if (value) {
      this.selectPathway(value);
    }
  })
  @Input() node: FlBioNetworkReaction;

  pathways: FlBioNetworkPathwayDetail[];

  constructor(private state: FlBioNetworkState) {
  }

  ngOnInit(): void {
  }

  private selectPathway(node: FlBioNetworkReaction): void {
    const pathways = node.enzyme.pathways[this.state.getDatabase()];
    this.pathways = FlBioNetworkHelper.splitReactionPathway(pathways);
  }


}

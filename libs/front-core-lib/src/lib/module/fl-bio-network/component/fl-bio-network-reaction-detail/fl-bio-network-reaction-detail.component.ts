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
      this.pathways = this.getPathways(value);
    }
  })
  @Input() node: FlBioNetworkReaction;

  pathways: FlBioNetworkPathwayDetail[];

  constructor(private state: FlBioNetworkState) {
  }

  ngOnInit(): void {
  }

  private getPathways(node: FlBioNetworkReaction): FlBioNetworkPathwayDetail[] {
    if (!node.enzyme || !node.enzyme.pathways) return null;
    const pathways = node.enzyme.pathways[this.state.getDatabase()];

    if (!pathways) return null;
    return FlBioNetworkHelper.splitReactionPathway(pathways);
  }


}

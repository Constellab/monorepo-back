import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FlBioNetworkReaction, FlBioNetworkReactionDataFlux} from '../../model/fl-bio-network.class';
import {FlBioNetworkHelper} from '../../utils/fl-bio-network.helper';

/**
 * Show the information about a reaction flux
 */
@Component({
  selector: 'fl-bio-network-reaction-flux',
  templateUrl: './fl-bio-network-reaction-flux.component.html',
  styleUrls: ['./fl-bio-network-reaction-flux.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkReactionFluxComponent implements OnInit {

  @Input() reaction: FlBioNetworkReaction;

  constructor() {
  }

  ngOnInit(): void {
  }

  get getFlux(): FlBioNetworkReactionDataFlux {
    return FlBioNetworkHelper.getReactionFlux(this.reaction.data);
  }

  get hasConstraints(): boolean {
    return this.reaction.lower_bound != null && this.reaction.upper_bound != null;
  }

  get fluxConstraintsTooltip(): string {
    if (this.hasConstraints) {
      return `[${this.reaction.lower_bound},${this.reaction.upper_bound}]`;
    }
    return null;
  }

  fluxEstimateInterval(flux: FlBioNetworkReactionDataFlux): string {
    if (flux.upper_bound != null && flux.lower_bound != null) {
      return `[${flux.lower_bound},${flux.upper_bound}]`;
    }
    return null;
  }

}

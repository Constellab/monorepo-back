import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FlBioNetworkReaction} from '../../model/fl-bio-network.class';

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

  get hasFlux(): boolean {
    return this.reaction.data?.flux_estimates != null ?? false;
  }

  get hasConstraints(): boolean {
    return this.reaction.lower_bound != null && this.reaction.upper_bound != null;
  }

  get hasEstimateInterval(): boolean {
    return this.reaction.data?.flux_estimates.lower_bounds != null && this.reaction.data?.flux_estimates.upper_bounds != null;
  }

  get fluxConstraintsTooltip(): string {
    if (this.hasConstraints) {
      return `[${this.reaction.lower_bound},${this.reaction.upper_bound}]`;
    }
    return null;
  }

  get fluxEstimateInterval(): string {
    if (this.hasEstimateInterval) {
      return `[${this.reaction.data.flux_estimates.lower_bounds[0]},${this.reaction.data.flux_estimates.upper_bounds[0]}]`;
    }
    return null;
  }

}

import {Component, Input, OnInit} from '@angular/core';
import {firstValueFrom, Observable, of, switchMap} from 'rxjs';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {FlBioNetworkNodeReaction} from '../../model/fl-bio-network-node-reaction.class';
import {map} from 'rxjs/operators';
import {FlBioNetworkGraph} from '../../model/fl-bio-network-graph.class';
import {FlBioNetworkSelectionState} from '../../state/fl-bio-network-selection.state';
import {FlBioNetworkMetabolite} from '../../model/fl-bio-network.class';

/**
 * Section to display the substrate and products of a reaction
 */
@Component({
  selector: 'fl-bio-network-reaction-content',
  templateUrl: './fl-bio-network-reaction-content.component.html',
  styleUrls: ['./fl-bio-network-reaction-content.component.scss']
})
export class FlBioNetworkReactionContentComponent implements OnInit {

  @Input() reaction$: Observable<FlBioNetworkNodeReaction>;

  reactionSubstrate$: Observable<FlBioNetworkMetabolite[]>;
  reactionProducts$: Observable<FlBioNetworkMetabolite[]>;

  constructor(private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionState) {
  }

  ngOnInit(): void {
    this.reactionSubstrate$ = this.reaction$.pipe(
      switchMap(node => this.getRelatedMetabolite(node, 'substrat')),
    );

    this.reactionProducts$ = this.reaction$.pipe(
      switchMap(node => this.getRelatedMetabolite(node, 'product')),
    );
  }

  private getRelatedMetabolite(reaction: FlBioNetworkNodeReaction, type: 'product' | 'substrat'):
    Observable<FlBioNetworkMetabolite[]> {
    if (reaction == null) return of([]);

    return this.state.getChartData$().pipe(
      map(chartData => this.getReactionContent(reaction, chartData, type))
    );
  }

  /**
   * Get the list of metabolite object (not node, it ignores the cluster) related to the reaction
   * @param reaction
   * @param chartData
   * @param type
   * @private
   */
  private getReactionContent(reaction: FlBioNetworkNodeReaction, chartData: FlBioNetworkGraph,
                             type: 'product' | 'substrat'): FlBioNetworkMetabolite[] {
    const ids = type === 'product' ? reaction.getProductIds() : reaction.getSubstratIds();

    const metabolites: FlBioNetworkMetabolite[] = [];
    for (const productId of ids) {
      const nodes = chartData.getMetaboliteAndCofactors().filter(n => n.data.id === productId);
      if (nodes.length > 0) metabolites.push(nodes[0].data);
    }
    return metabolites;
  }

  /**
   * Select the node in the graph based on the metabolite id
   * If the metabolite is in the same cluster, select the node in the cluster
   * If the metabolite is not in the same cluster, select the first found node in the graph
   * @param metabolite
   * @param type
   */
  async selectNode(metabolite: FlBioNetworkMetabolite, type: 'product' | 'substrat'): Promise<void> {
    const reaction = await firstValueFrom(this.reaction$);

    // check if the metabolite is in the same cluster
    const connectedNodes = type === 'product' ? reaction.getNextMetabolites() : reaction.getPreviousMetabolites();
    const sameClusterNode = connectedNodes.find(n => n.data.id === metabolite.id);
    if (sameClusterNode != null) {
      this.selectionState.selectNode(sameClusterNode, 'singleNode');
      return;
    }

    // select the first found node in the graph
    const chartData = await firstValueFrom(this.state.getChartData$());
    const node = chartData.getMetaboliteAndCofactors().find(n => n.data.id === metabolite.id);
    if (node != null) {
      this.selectionState.selectNode(node, 'singleNode');
    }
  }

}

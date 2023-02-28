import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {
  FlBioNetworkDrawerState,
  FlBioNetworkNode,
  FlBioNetworkNodeCofactor,
  FlBioNetworkNodeMetabolite,
  FlBioNetworkNodeReaction,
  FlBioNetworkSelectionState,
  FlBioNetworkState
} from '@monorepo/front-core-lib';
import {filter, map, switchMap} from 'rxjs/operators';
import {clRxjsDebug} from '@monorepo/core-lib';

/**
 * Detail information about one reaction node
 */
@Component({
  selector: 'fl-bio-network-node-reaction-detail',
  templateUrl: './fl-bio-network-node-reaction-detail.component.html',
  styleUrls: ['./fl-bio-network-node-reaction-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkNodeReactionDetailComponent implements OnInit {

  node$: Observable<FlBioNetworkNodeReaction>;

  // list of the same metabolite node
  duplicateReactions$: Observable<FlBioNetworkNodeReaction[]>;

  reactionProducts$: Observable<(FlBioNetworkNodeMetabolite | FlBioNetworkNodeCofactor)[]>;

  reactionSubstrate$: Observable<(FlBioNetworkNodeMetabolite | FlBioNetworkNodeCofactor)[]>;

  constructor(private drawerState: FlBioNetworkDrawerState,
              private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionState) {
  }

  ngOnInit(): void {
    this.node$ = this.drawerState.getState$().pipe(
      filter(state => state.selectedNode instanceof FlBioNetworkNodeReaction),
      map(state => state.selectedNode as FlBioNetworkNodeReaction),
      clRxjsDebug(),
    );

    // retrieve all the nodes with the same reaction id
    this.duplicateReactions$ = this.node$.pipe(
      switchMap(node => this.state.getChartData$().pipe(
        map(chartData => chartData?.getReactionNodesByObjectId(node.data.id) ?? [])
      )));

    this.reactionProducts$ = this.node$.pipe(
      map(node => node?.getPreviousMetabolites() ?? []),
    );

    this.reactionSubstrate$ = this.node$.pipe(
      map(node => node?.getNextMetabolites() ?? []),
    );
  }

  selectNode(node: FlBioNetworkNode): void {
    this.selectionState.selectNode(node, 'singleNode');
  }

}

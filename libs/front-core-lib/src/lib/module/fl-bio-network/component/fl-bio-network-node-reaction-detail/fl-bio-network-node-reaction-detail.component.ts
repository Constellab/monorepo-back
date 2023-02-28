import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {
  FlBioNetworkDrawerState,
  FlBioNetworkNode,
  FlBioNetworkNodeReaction,
  FlBioNetworkSelectionState,
  FlBioNetworkState
} from '@monorepo/front-core-lib';
import {filter, map, switchMap} from 'rxjs/operators';

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


  constructor(private drawerState: FlBioNetworkDrawerState,
              private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionState) {
  }

  ngOnInit(): void {
    this.node$ = this.drawerState.getState$().pipe(
      filter(state => state.selectedNode instanceof FlBioNetworkNodeReaction),
      map(state => state.selectedNode as FlBioNetworkNodeReaction),
    );

    // retrieve all the nodes with the same reaction id
    this.duplicateReactions$ = this.node$.pipe(
      switchMap(node => this.state.getChartData$().pipe(
        map(chartData => chartData?.getReactionNodesByObjectId(node.data.id) ?? [])
      )));
  }

  selectNode(node: FlBioNetworkNode): void {
    this.selectionState.selectNode(node, 'singleNode');
  }

}

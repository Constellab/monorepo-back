import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {
  FlBioNetworkDrawerState,
  FlBioNetworkNode,
  FlBioNetworkNodeMetabolite,
  FlBioNetworkNodeReaction,
  FlBioNetworkSelectionState,
  FlBioNetworkState
} from '@monorepo/front-core-lib';
import {map} from 'rxjs/operators';

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

  reactionProducts$: Observable<FlBioNetworkNodeMetabolite[]>;

  reactionSubstrate$: Observable<FlBioNetworkNodeMetabolite[]>;

  constructor(private drawerState: FlBioNetworkDrawerState,
              private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionState) {
  }

  ngOnInit(): void {
    this.node$ = this.drawerState.getState$().pipe(
      map(state => state.selectedNode as FlBioNetworkNodeReaction)
    );

    this.reactionProducts$ = this.node$.pipe(
      map(node => node.getPreviousNodes() as FlBioNetworkNodeMetabolite[])
    );

    this.reactionSubstrate$ = this.node$.pipe(
      map(node => node.getNextNodes() as FlBioNetworkNodeMetabolite[])
    );
  }

  selectNode(node: FlBioNetworkNode): void {
    this.selectionState.selectNode(node, 'singleNode');
  }

}

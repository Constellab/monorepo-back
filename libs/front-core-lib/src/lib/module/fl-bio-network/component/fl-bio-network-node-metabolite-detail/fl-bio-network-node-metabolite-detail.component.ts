import {Component, OnInit} from '@angular/core';
import {
  FlBioNetworkDrawerState,
  FlBioNetworkNode,
  FlBioNetworkNodeMetabolite,
  FlBioNetworkNodeReaction,
  FlBioNetworkSelectionState,
  FlBioNetworkState
} from '@monorepo/front-core-lib';
import {filter, map, switchMap} from 'rxjs/operators';
import {Observable} from 'rxjs';

/**
 * Detail information about one metabolite node
 */
@Component({
  selector: 'fl-bio-network-node-metabolite-detail',
  templateUrl: './fl-bio-network-node-metabolite-detail.component.html',
  styleUrls: ['./fl-bio-network-node-metabolite-detail.component.scss']
})
export class FlBioNetworkNodeMetaboliteDetailComponent implements OnInit {

  node$: Observable<FlBioNetworkNodeMetabolite>;

  // list of the same metabolite node
  duplicateMetabolites$: Observable<FlBioNetworkNodeMetabolite[]>;

  connectedReaction$: Observable<FlBioNetworkNodeReaction[]>;

  constructor(private drawerState: FlBioNetworkDrawerState,
              private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionState) {
  }

  ngOnInit(): void {
    this.node$ = this.drawerState.getState$().pipe(
      filter(state => state.selectedNode instanceof FlBioNetworkNodeMetabolite),
      map(state => state.selectedNode as FlBioNetworkNodeMetabolite)
    );

    // retrieve all the nodes with the same metabolite id
    this.duplicateMetabolites$ = this.node$.pipe(
      switchMap(node => this.state.getChartData$().pipe(
        map(chartData => chartData?.getMetaboliteNodesByObjectId(node.data.id) ?? [])
      )));

    // retrieve all the reactions connected to the metabolite
    this.connectedReaction$ = this.node$.pipe(
      map(node => node?.getConnectedNodes() as FlBioNetworkNodeReaction[] ?? [])
    );
  }

  selectNode(node: FlBioNetworkNode): void {
    this.selectionState.selectNode(node, 'singleNode');
  }

}

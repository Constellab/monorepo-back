import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FlBioNetworkDrawerState, FlBioNetworkNodeCofactor} from '@monorepo/front-core-lib';
import {filter, map} from 'rxjs/operators';

/**
 * Detail information about one cofactor node
 */
@Component({
  selector: 'fl-bio-network-node-cofactor-detail',
  templateUrl: './fl-bio-network-node-cofactor-detail.component.html',
  styleUrls: ['./fl-bio-network-node-cofactor-detail.component.scss']
})
export class FlBioNetworkNodeCofactorDetailComponent implements OnInit {

  node$: Observable<FlBioNetworkNodeCofactor>;

  constructor(private drawerState: FlBioNetworkDrawerState) {
  }

  ngOnInit(): void {
    this.node$ = this.drawerState.getState$().pipe(
      filter(state => state.selectedNode instanceof FlBioNetworkNodeCofactor),
      map(state => state.selectedNode as FlBioNetworkNodeCofactor)
    );
  }

}

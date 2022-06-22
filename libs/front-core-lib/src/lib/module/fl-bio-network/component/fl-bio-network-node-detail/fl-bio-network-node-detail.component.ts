import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FlBioNetworkNode} from '../../model/fl-bio-network-node.class';
import {FlBioNetworkDrawerState} from '../../state/fl-bio-network-drawer.state';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'fl-bio-network-node-detail',
  templateUrl: './fl-bio-network-node-detail.component.html',
  styleUrls: ['./fl-bio-network-node-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkNodeDetailComponent implements OnInit {

  node$: Observable<FlBioNetworkNode>;

  constructor(private drawerState: FlBioNetworkDrawerState) {
  }

  ngOnInit(): void {
    this.node$ = this.drawerState.getState$().pipe(
      map(state => state.selectedNode)
    );
  }

}

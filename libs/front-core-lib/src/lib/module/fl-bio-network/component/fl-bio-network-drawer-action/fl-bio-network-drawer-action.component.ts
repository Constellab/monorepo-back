import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FlBioNetworkDrawerAction} from '../../model/fl-bio-network-drawer-action.class';
import {Observable} from 'rxjs';
import {FlBioNetworkDrawerState} from '../../state/fl-bio-network-drawer.state';

@Component({
  selector: 'fl-bio-network-drawer-action',
  templateUrl: './fl-bio-network-drawer-action.component.html',
  styleUrls: ['./fl-bio-network-drawer-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkDrawerActionComponent implements OnInit {

  action$: Observable<FlBioNetworkDrawerAction>;

  constructor(private drawerState: FlBioNetworkDrawerState) {
  }

  ngOnInit(): void {
    this.action$ = this.drawerState.getAction$();
  }

}

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {FlBioNetworkDrawerState} from '../../state/fl-bio-network-drawer.state';
import {FlBioNetworkDrawerActionName} from '../../model/fl-bio-network-drawer-action.class';
import {MatTabGroup} from '@angular/material/tabs';

@Component({
  selector: 'fl-bio-network-drawer-action',
  templateUrl: './fl-bio-network-drawer-action.component.html',
  styleUrls: ['./fl-bio-network-drawer-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkDrawerActionComponent implements OnInit, OnDestroy {

  @ViewChild(MatTabGroup, {static: true}) tab: MatTabGroup;

  subscription: Subscription;

  tabIndex: number;

  constructor(private drawerState: FlBioNetworkDrawerState,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.drawerState.getState$().subscribe(
      state => this.changeTab(state.action)
    );
  }

  private changeTab(action: FlBioNetworkDrawerActionName): void {
    switch (action) {
      case 'config':
        this.tabIndex = 0;
        break;
      case 'nodeDetail':
        this.tabIndex = 1;
        break;
    }
    this.cdr.detectChanges();
  }

  closeDrawer(): void {
    this.drawerState.closeDrawer();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


}

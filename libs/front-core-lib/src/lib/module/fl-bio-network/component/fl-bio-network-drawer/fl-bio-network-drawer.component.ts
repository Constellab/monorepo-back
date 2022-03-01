import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {FlBioNetworkDrawerState} from '../../state/fl-bio-network-drawer.state';
import {FlBioNetworkDrawerActionName} from '../../model/fl-bio-network-drawer-action.class';
import {MatTabGroup} from '@angular/material/tabs';
import {flCdkOverlayContainerClass} from '../../../../utils/fl-material.config';

@Component({
  selector: 'fl-bio-network-drawer',
  templateUrl: './fl-bio-network-drawer.component.html',
  styleUrls: ['./fl-bio-network-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkDrawerComponent implements OnInit, OnDestroy {

  @ViewChild(MatTabGroup, {static: true}) tab: MatTabGroup;

  tabIndex: number;

  pinnedDrawer: boolean = false;

  // use to ignore the mouse event on the CDK to keep the drawer open if an overlay is opened
  cdkContainerClass: string = flCdkOverlayContainerClass;

  private subscription: Subscription;

  constructor(private drawerState: FlBioNetworkDrawerState,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.subscription = this.drawerState.getState$().subscribe(
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
    this.subscription?.unsubscribe();
  }


}

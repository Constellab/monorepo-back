import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FlBioNetwork} from '../../model/fl-bio-network.class';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {MatDrawer} from '@angular/material/sidenav';
import {FlBioNetworkDrawerState} from '../../state/fl-bio-network-drawer.state';
import {FlBioNetworkOptionsState} from '../../state/fl-bio-network-options.state';
import {FlBioNetworkSelectionState} from '../../state/fl-bio-network-selection.state';
import {FlBioNetworkMainRenderer} from '../../renderer/fl-bio-network-main.renderer';
import {FlBioNetworkGridState} from '../../state/fl-bio-network-grid.state';
import {FlBioNetworkZoomRenderer} from '../../renderer/fl-bio-network-zoom.renderer';
import {FlBioNetworkSimulationState} from '../../state/fl-bio-network-simulation.state';
import {FlBioNetworkEngineState} from '../../state/fl-bio-network-engine.state';


@Component({
  selector: 'fl-bio-network',
  templateUrl: './fl-bio-network.component.html',
  styleUrls: ['./fl-bio-network.component.scss'],
  providers: [
    FlBioNetworkState,
    FlBioNetworkDrawerState,
    FlBioNetworkOptionsState,
    FlBioNetworkSelectionState,
    FlBioNetworkMainRenderer,
    FlBioNetworkGridState,
    FlBioNetworkZoomRenderer,
    FlBioNetworkEngineState,
    FlBioNetworkSimulationState,
  ]
})
export class FlBioNetworkComponent implements OnInit {
  @Input() networks: FlBioNetwork;

  @ViewChild('networkContainer', {static: true}) networkContainer: ElementRef;

  @ViewChild(MatDrawer, {static: true}) drawer: MatDrawer;


  constructor(private state: FlBioNetworkState,
              private drawerState: FlBioNetworkDrawerState,
              private rendererState: FlBioNetworkMainRenderer,
              private zoomRenderer: FlBioNetworkZoomRenderer) {
  }

  ngOnInit(): void {
    this.state.init(this.networks);
    // init the drawer state
    this.drawerState.init(this.drawer);

    this.rendererState.init(this.networkContainer.nativeElement);
    this.zoomRenderer.init();
  }

  openDrawer(): void {
    this.drawerState.openDrawer();
  }

  closeDrawer(): void {
    this.drawerState.closeDrawer();
  }

}

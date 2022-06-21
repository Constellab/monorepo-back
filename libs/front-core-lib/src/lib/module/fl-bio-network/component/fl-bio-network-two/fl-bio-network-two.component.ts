import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FlBioNetwork} from '../../model/fl-bio-network.class';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {MatDrawer, MatSidenav} from '@angular/material/sidenav';
import {FlBioNetworkDrawerState} from '../../state/fl-bio-network-drawer.state';
import {FlBioNetworkOptionsState} from '../../state/fl-bio-network-options.state';
import {FlBioNetworkSelectionTwoState} from '../../state/fl-bio-network-selection-two.state';
import {FlBioNetworkMainTwoRenderer} from '../../renderer/fl-bio-network-main-two.renderer';
import {FlBioNetworkGridRenderer} from '../../renderer/fl-bio-network-grid.renderer';
import {FlBioNetworkGridTwoState} from '../../state/fl-bio-network-grid-two.state';
import {FlBioNetworkZoomRenderer} from '../../renderer/fl-bio-network-zoom.renderer';
import {FlBioNetworkColorRenderer} from '../../renderer/fl-bio-network-color.renderer';
import {FlBioNetworkSimulationState} from '../../state/fl-bio-network-simulation.state';
import {FlBioNetworkNodesRenderer} from '../../renderer/fl-bio-network-nodes.renderer';
import {FlBioNetworkLinksRenderer} from '../../renderer/fl-bio-network-links.renderer';


@Component({
  selector: 'fl-bio-network-two',
  templateUrl: './fl-bio-network-two.component.html',
  styleUrls: ['./fl-bio-network-two.component.scss'],
  providers: [
    FlBioNetworkState,
    FlBioNetworkDrawerState,
    FlBioNetworkOptionsState,
    FlBioNetworkSelectionTwoState,
    FlBioNetworkMainTwoRenderer,
    FlBioNetworkGridTwoState,
    FlBioNetworkGridRenderer,
    FlBioNetworkZoomRenderer,
    FlBioNetworkColorRenderer,
    FlBioNetworkSimulationState,
    FlBioNetworkNodesRenderer,
    FlBioNetworkLinksRenderer,
  ]
})
export class FlBioNetworkTwoComponent implements OnInit {
  @Input() networks: FlBioNetwork;

  @ViewChild('networkContainer', {static: true}) networkContainer: ElementRef;
  // TOdo swtich to drawer
  @ViewChild(MatSidenav, {static: true}) drawer: MatDrawer;


  constructor(private state: FlBioNetworkState,
              private drawerState: FlBioNetworkDrawerState,
              private rendererState: FlBioNetworkMainTwoRenderer,
              private zoomRenderer: FlBioNetworkZoomRenderer,
              private colorRenderer: FlBioNetworkColorRenderer) {
  }

  ngOnInit(): void {
    this.state.init(this.networks, 'kegg');
    // init the drawer state
    this.drawerState.init(this.drawer);

    this.rendererState.init(this.networkContainer.nativeElement);
    this.colorRenderer.init();
    this.zoomRenderer.init();
  }

  openDrawer(): void {
    this.drawerState.openDrawer();
  }

  closeDrawer(): void {
    this.drawerState.closeDrawer();
  }

}

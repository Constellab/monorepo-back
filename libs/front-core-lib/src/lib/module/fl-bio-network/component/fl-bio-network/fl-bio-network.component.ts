import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FlBioNetwork} from '../../model/fl-bio-network.class';
import {FlBioNetworkDrawerState} from '../../state/fl-bio-network-drawer.state';
import {MatDrawer, MatSidenav} from '@angular/material/sidenav';
import {FlBioNetworkRendererState} from '../../state/fl-bio-network-renderer.state';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {FlBioNetworkSelectionState} from '../../state/fl-bio-network-selection.state';
import {FlBioNetworkZoomState} from '../../state/fl-bio-network-zoom.state';
import {FlBioNetworkGridState} from '../../state/fl-bio-network-grid.state';

@Component({
  selector: 'fl-bio-network',
  templateUrl: './fl-bio-network.component.html',
  styleUrls: ['./fl-bio-network.component.scss'],
  providers: [
    FlBioNetworkState,
    FlBioNetworkRendererState,
    FlBioNetworkDrawerState,
    FlBioNetworkZoomState,
    FlBioNetworkSelectionState,
    FlBioNetworkGridState,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkComponent implements OnInit, AfterViewInit {

  @Input() data: FlBioNetwork | FlBioNetwork[];

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;
  @ViewChild(MatSidenav, {static: true}) drawer: MatDrawer;

  constructor(private cdr: ChangeDetectorRef,
              private state: FlBioNetworkState,
              private drawerState: FlBioNetworkDrawerState,
              private rendererState: FlBioNetworkRendererState) {
  }

  ngOnInit(): void {
    if (this.data == null) {
      console.error('[FlChartPathwayComponent] Data not provided');
    }

    // init the pathway state
    this.state.init(this.data, 'kegg');
    // init the drawer state
    this.drawerState.init(this.drawer);
  }

  ngAfterViewInit(): void {
    this.rendererState.init(this.chartHtmlContainer.nativeElement, false);
  }

  openDrawer(): void {
    this.drawerState.openDrawer();
  }

  closeDrawer(): void {
    this.drawerState.closeDrawer();
  }


}

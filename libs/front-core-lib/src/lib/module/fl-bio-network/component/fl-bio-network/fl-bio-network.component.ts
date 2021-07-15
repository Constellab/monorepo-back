import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {FlBioNetwork} from '../../model/fl-bio-network.class';
import {MatSliderChange} from '@angular/material/slider';
import {FlBioNetworkDrawerState} from '../../state/fl-bio-network-drawer.state';
import {MatDrawer, MatSidenav} from '@angular/material/sidenav';
import {FlBioNetworkRendererState} from '../../state/fl-bio-network-renderer.state';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {FlBioxNetworkD3} from '../../model/fl-bio-network-d3.class';
import {Subscription} from 'rxjs';

@Component({
  selector: 'fl-bio-network',
  templateUrl: './fl-bio-network.component.html',
  styleUrls: ['./fl-bio-network.component.scss'],
  providers: [
    FlBioNetworkState,
    FlBioNetworkRendererState,
    FlBioNetworkDrawerState
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() data: FlBioNetwork | FlBioNetwork[];

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;
  @ViewChild(MatSidenav, {static: true}) drawer: MatDrawer;

  sliderValue: number = 0;
  linksMaxAbsValue: number;

  // if true the link colors switch to logarithm
  slideLinkColorToggle: boolean = false;

  private subscription: Subscription;

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
    this.listenToDrawer();
  }

  ngAfterViewInit(): void {
    this.rendererState.init(this.chartHtmlContainer.nativeElement, this.slideLinkColorToggle);

    this.subscription = this.state.getChartData$().subscribe(
      chartData => this.onNewData(chartData)
    );

    // avoid change detection error as we are in AfterViewInit
    this.cdr.detectChanges();
  }

  private onNewData(chartData: FlBioxNetworkD3): void {
    if (chartData) {
      this.linksMaxAbsValue = chartData.getLinksMaxAbsoluteValue();
    } else {
      this.linksMaxAbsValue = 0;
    }

    this.cdr.markForCheck();
  }


  setLinksColors(): void {
    this.rendererState.setLinksColors(this.slideLinkColorToggle);
  }

  // set opacity to 0.1 to link where abs value is lower than slider value
  hideLinkLowerThan(change: MatSliderChange): void {
    this.rendererState.hideLinkLowerThan(change.value);
  }

  get slideLinkColorToggleText(): string {
    return this.slideLinkColorToggle ? 'flBioNetwork.link_color_log' : 'flBioNetwork.link_color_normal';
  }

  private listenToDrawer(): void {
    this.drawerState.drawerClosed$().subscribe(
      () => this.onDrawerClosed()
    );
  }

  private onDrawerClosed(): void {
    // if the action select node was closed
    this.rendererState.resetNodeAndLinkOpacity();
    // also reset slider
    this.sliderValue = 0;

    this.cdr.markForCheck();
  }

  openDrawer(): void {
    this.drawerState.openDrawer();
  }

  closeDrawer(): void {
    this.drawerState.closeDrawer();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


}

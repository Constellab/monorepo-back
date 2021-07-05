import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FlPathway} from '../../model/fl-pathway.class';
import {MatSliderChange} from '@angular/material/slider';
import {FLPathwayDrawerChanged, FlPathwayDrawerState} from '../../state/fl-pathway-drawer.state';
import {MatDrawer} from '@angular/material/sidenav';
import {FlPathwayRendererState} from '../../state/fl-pathway-renderer.state';
import {FlPathwayState} from '../../state/fl-pathway.state';
import {FlChartPathwayData} from '../../model/fl-chart-pathway.class';

@Component({
  selector: 'fl-chart-pathway',
  templateUrl: './fl-chart-pathway.component.html',
  styleUrls: ['./fl-chart-pathway.component.scss'],
  providers: [
    FlPathwayState,
    FlPathwayRendererState,
    FlPathwayDrawerState
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlChartPathwayComponent implements OnInit, AfterViewInit {

  @Input() data: FlPathway;

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;
  @ViewChild(MatDrawer, {static: true}) drawer: MatDrawer;

  disableSlider: boolean = false;
  sliderValue: number = 0;
  linksMaxAbsValue: number;

  // if true the link colors switch to logarithm
  slideLinkColorToggle: boolean = false;


  constructor(private cdr: ChangeDetectorRef,
              private state: FlPathwayState,
              private drawerState: FlPathwayDrawerState,
              private rendererState: FlPathwayRendererState) {
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


    // open config on start
    this.openConfig();
  }

  ngAfterViewInit(): void {
    this.rendererState.init(this.chartHtmlContainer.nativeElement);

    this.state.getChartData$().subscribe(
      chartData => this.onNewData(chartData)
    );

    // avoid change detection error as we are in AfterViewInit
    this.cdr.detectChanges();
  }

  private onNewData(chartData: FlChartPathwayData): void {
    if (chartData) {
      this.linksMaxAbsValue = chartData.getLinksMaxAbsoluteValue();
    } else {
      this.linksMaxAbsValue = 0;
    }

    // todo move from here
    this.rendererState.drawPathway(chartData, this.slideLinkColorToggle);

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
    return this.slideLinkColorToggle ? 'flChart.pathway_link_color_log' : 'flChart.pathway_link_color_normal';
  }

  private listenToDrawer(): void {
    this.drawerState.openChange$().subscribe(
      change => this.onDrawerOpenChanged(change)
    );
  }

  private onDrawerOpenChanged(change: FLPathwayDrawerChanged): void {
    // disable the slider when the node detail drawer is open
    this.disableSlider = change.open && change.action?.action === 'nodeDetail';

    // if the action select node was closed
    if (!change.open && change.action?.action === 'nodeDetail') {
      this.rendererState.resetNodeAndLinkOpacity();
      // also reset slider
      this.sliderValue = 0;
    }

    this.cdr.markForCheck();
  }

  openConfig(): void {
    this.drawerState.newAction({title: 'Config', action: 'config', data: null});
  }
}

import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {FlBioNetworkDrawerState} from '../../state/fl-bio-network-drawer.state';
import {FlBioNetworkRendererState} from '../../state/fl-bio-network-renderer.state';
import {FlBioxNetworkD3} from '../../model/fl-bio-network-d3.class';
import {MatSliderChange} from '@angular/material/slider';

/**
 * Component inside the {@link FlBioNetworkComponent} to show the quick actions
 */
@Component({
  selector: 'fl-bio-network-action-bar',
  templateUrl: './fl-bio-network-action-bar.component.html',
  styleUrls: ['./fl-bio-network-action-bar.component.scss']
})
export class FlBioNetworkActionBarComponent implements OnInit {

  sliderValue: number = 0;
  linksMaxAbsValue: number;

  // if true the link colors switch to logarithm
  slideLinkColorToggle: boolean = false;

  constructor(private cdr: ChangeDetectorRef,
              private state: FlBioNetworkState,
              private drawerState: FlBioNetworkDrawerState,
              private rendererState: FlBioNetworkRendererState) {
  }

  ngOnInit(): void {
    this.state.getChartData$().subscribe(
      chartData => this.onNewData(chartData)
    );

    this.drawerState.drawerClosed$().subscribe(
      () => this.resetSlider()
    );
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

  private resetSlider(): void {
    // also reset slider
    this.sliderValue = 0;

    this.cdr.markForCheck();
  }

  get slideLinkColorToggleText(): string {
    return this.slideLinkColorToggle ? 'flBioNetwork.link_color_log' : 'flBioNetwork.link_color_normal';
  }


}

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FlBioNetworkZoomState} from '../../state/fl-bio-network-zoom.state';
import {MatSliderChange} from '@angular/material/slider';

@Component({
  selector: 'fl-bio-network-zoom',
  templateUrl: './fl-bio-network-zoom.component.html',
  styleUrls: ['./fl-bio-network-zoom.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkZoomComponent implements OnInit {

  value: number;
  min: number;
  max: number;

  constructor(private zoomState: FlBioNetworkZoomState,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.min = this.zoomState.minZoomScale;
    this.max = this.zoomState.maxZoomScale;

    // this.zoomState.getZoom$().subscribe(
    //   zoom => this.setValue(zoom)
    // );
  }

  // private setValue(zoom: ZoomTransform): void {
  //   console.log('SetValue', zoom.k);
  //   this.value = zoom.k;
  //   this.cdr.markForCheck();
  // }


  test(ev: WheelEvent): void {
    console.log(ev.deltaY);
    console.log(this.zoomState.zoomHandler.wheelDelta()(null, 0, [this.zoomState.svg]));
  }

  onSlideChange(change: MatSliderChange): void {
    console.log('Change', change.value);
    // this.zoomState.zoom(0.9);
  }

  // zoomIn(): void {
    // this.zoomState.zoom(1.2);
  // }

  // zoomOut(): void {
    // this.zoomState.zoom(0.8);
  // }

}

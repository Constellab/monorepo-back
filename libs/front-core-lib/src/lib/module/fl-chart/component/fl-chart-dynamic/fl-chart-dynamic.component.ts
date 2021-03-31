import {Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ComponentType} from '@angular/cdk/overlay';
import {FlChartComponent, FlChartComponentType, flChartComponentTypeFactory} from '../../model/fl-chart-component.class';

@Component({
  selector: 'fl-chart-dynamic',
  templateUrl: './fl-chart-dynamic.component.html',
  styleUrls: ['./fl-chart-dynamic.component.scss']
})
export class FlChartDynamicComponent implements OnInit {

  @Input() data: any;

  @Input() chartComponent: ComponentType<FlChartComponent> | FlChartComponentType;

  // get a view ref to generate chart component in it
  @ViewChild('vc', {read: ViewContainerRef, static: true}) vc: ViewContainerRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit(): void {
    this.initChart();
  }

  private initChart(): void {
    const chartComponent: ComponentType<FlChartComponent> = flChartComponentTypeFactory(this.chartComponent);

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(chartComponent);

    const componentRef = this.vc.createComponent<FlChartComponent>(componentFactory);
    componentRef.instance.data = this.data;
  }

}

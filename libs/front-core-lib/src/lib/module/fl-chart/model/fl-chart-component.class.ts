import {ComponentType} from '@angular/cdk/overlay';


export interface FlChartComponent {
  data: any;
}

export interface FlChartDynamicConfig {
  data: any;

  component: ComponentType<FlChartComponent>;
}

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartLegendHeatMapComponent} from './fl-chart-legend-heat-map.component';

describe('FlChartLegendHeatMapComponent', () => {
  let component: FlChartLegendHeatMapComponent;
  let fixture: ComponentFixture<FlChartLegendHeatMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartLegendHeatMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartLegendHeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

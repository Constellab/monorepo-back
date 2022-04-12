import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartLegendMultiSeriesComponent} from './fl-chart-legend-multi-series.component';

describe('FlChartLegendMultiSeriesComponent', () => {
  let component: FlChartLegendMultiSeriesComponent;
  let fixture: ComponentFixture<FlChartLegendMultiSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartLegendMultiSeriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartLegendMultiSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartScatterPlotMultipleComponent } from './fl-chart-scatter-plot-multiple.component';

describe('FlChartScatterPlotMultipleComponent', () => {
  let component: FlChartScatterPlotMultipleComponent;
  let fixture: ComponentFixture<FlChartScatterPlotMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartScatterPlotMultipleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartScatterPlotMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

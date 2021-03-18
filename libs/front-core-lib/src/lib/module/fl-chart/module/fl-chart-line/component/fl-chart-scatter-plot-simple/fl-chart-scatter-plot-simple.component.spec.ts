import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartScatterPlotSimpleComponent } from './fl-chart-scatter-plot-simple.component';

describe('FlChartLineScatterPlotSimpleComponent', () => {
  let component: FlChartScatterPlotSimpleComponent;
  let fixture: ComponentFixture<FlChartScatterPlotSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartScatterPlotSimpleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartScatterPlotSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

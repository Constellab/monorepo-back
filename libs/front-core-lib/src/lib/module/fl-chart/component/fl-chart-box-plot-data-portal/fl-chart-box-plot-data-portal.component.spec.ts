import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartBoxPlotDataPortalComponent} from './fl-chart-box-plot-data-portal.component';

describe('FlChartBoxPlotDataPortalComponent', () => {
  let component: FlChartBoxPlotDataPortalComponent;
  let fixture: ComponentFixture<FlChartBoxPlotDataPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartBoxPlotDataPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartBoxPlotDataPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

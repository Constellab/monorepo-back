import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartLegendSeriesWithTagsComponent} from './fl-chart-legend-series-with-tags.component';

describe('FlChartLegendSeriesWithTagsComponent', () => {
  let component: FlChartLegendSeriesWithTagsComponent;
  let fixture: ComponentFixture<FlChartLegendSeriesWithTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartLegendSeriesWithTagsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartLegendSeriesWithTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

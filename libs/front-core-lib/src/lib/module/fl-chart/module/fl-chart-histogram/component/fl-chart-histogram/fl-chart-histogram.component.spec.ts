import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartHistogramComponent } from './fl-chart-histogram.component';

describe('FlChartHistogramComponent', () => {
  let component: FlChartHistogramComponent;
  let fixture: ComponentFixture<FlChartHistogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartHistogramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartHistogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

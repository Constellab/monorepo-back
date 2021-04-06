import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartHistogramMultipleComponent } from './fl-chart-histogram-multiple.component';

describe('FlChartHistogramMultipleComponent', () => {
  let component: FlChartHistogramMultipleComponent;
  let fixture: ComponentFixture<FlChartHistogramMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartHistogramMultipleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartHistogramMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

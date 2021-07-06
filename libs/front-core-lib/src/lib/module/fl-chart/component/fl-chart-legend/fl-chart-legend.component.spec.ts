import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartLegendComponent} from './fl-chart-legend.component';

describe('FlChartLegendComponent', () => {
  let component: FlChartLegendComponent;
  let fixture: ComponentFixture<FlChartLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartLegendComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

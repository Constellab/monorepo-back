import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartHeatMapComponent } from './fl-chart-heat-map.component';

describe('FlChartHeatMapComponent', () => {
  let component: FlChartHeatMapComponent;
  let fixture: ComponentFixture<FlChartHeatMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartHeatMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartHeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

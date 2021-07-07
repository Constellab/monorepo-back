import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartHeatMapDataPortalComponent} from './fl-chart-heat-map-data-portal.component';

describe('FlChartHeatMapDataPortalComponent', () => {
  let component: FlChartHeatMapDataPortalComponent;
  let fixture: ComponentFixture<FlChartHeatMapDataPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartHeatMapDataPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartHeatMapDataPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartDataWithSeriePortalComponent} from './fl-chart-data-with-serie-portal.component';

describe('FlChartDataWithSeriePortalComponent', () => {
  let component: FlChartDataWithSeriePortalComponent;
  let fixture: ComponentFixture<FlChartDataWithSeriePortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartDataWithSeriePortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartDataWithSeriePortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

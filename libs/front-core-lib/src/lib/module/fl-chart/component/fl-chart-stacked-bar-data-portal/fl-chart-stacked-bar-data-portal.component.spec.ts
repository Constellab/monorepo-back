import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartStackedBarDataPortalComponent} from './fl-chart-stacked-bar-data-portal.component';

describe('FlChartStackedBarDataPortalComponent', () => {
  let component: FlChartStackedBarDataPortalComponent;
  let fixture: ComponentFixture<FlChartStackedBarDataPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartStackedBarDataPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartStackedBarDataPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

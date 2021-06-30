import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartBinDataPortalComponent} from './fl-chart-bin-data-portal.component';

describe('FlChartBinDataPortalComponent', () => {
  let component: FlChartBinDataPortalComponent;
  let fixture: ComponentFixture<FlChartBinDataPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartBinDataPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartBinDataPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

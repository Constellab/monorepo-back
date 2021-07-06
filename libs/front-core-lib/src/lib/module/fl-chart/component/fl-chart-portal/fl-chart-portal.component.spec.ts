import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartPortalComponent} from './fl-chart-portal.component';

describe('FlChartDynamicPortalComponent', () => {
  let component: FlChartPortalComponent;
  let fixture: ComponentFixture<FlChartPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

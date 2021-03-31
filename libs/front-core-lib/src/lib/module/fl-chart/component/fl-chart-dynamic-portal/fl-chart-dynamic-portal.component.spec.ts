import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartDynamicPortalComponent } from './fl-chart-dynamic-portal.component';

describe('FlChartDynamicPortalComponent', () => {
  let component: FlChartDynamicPortalComponent;
  let fixture: ComponentFixture<FlChartDynamicPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartDynamicPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartDynamicPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

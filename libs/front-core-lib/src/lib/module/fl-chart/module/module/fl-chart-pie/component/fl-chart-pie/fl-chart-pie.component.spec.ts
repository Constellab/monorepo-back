import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartPieComponent } from './fl-chart-pie.component';

describe('FlChartPieComponent', () => {
  let component: FlChartPieComponent;
  let fixture: ComponentFixture<FlChartPieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartPieComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

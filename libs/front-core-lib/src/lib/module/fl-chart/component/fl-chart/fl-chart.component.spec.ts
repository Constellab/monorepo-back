import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartComponent} from './fl-chart.component';

describe('FlChartDynamicComponent', () => {
  let component: FlChartComponent;
  let fixture: ComponentFixture<FlChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartValueComponent} from './fl-chart-value.component';

describe('FlChartValueComponent', () => {
  let component: FlChartValueComponent;
  let fixture: ComponentFixture<FlChartValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartValueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlChartValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

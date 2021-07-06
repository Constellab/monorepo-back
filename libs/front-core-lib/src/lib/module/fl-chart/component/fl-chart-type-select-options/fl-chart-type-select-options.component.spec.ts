import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartTypeSelectOptionsComponent} from './fl-chart-type-select-options.component';

describe('FlChartComponentSelectOptionsComponent', () => {
  let component: FlChartTypeSelectOptionsComponent;
  let fixture: ComponentFixture<FlChartTypeSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartTypeSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartTypeSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartComponentSelectOptionsComponent } from './fl-chart-component-select-options.component';

describe('FlChartComponentSelectOptionsComponent', () => {
  let component: FlChartComponentSelectOptionsComponent;
  let fixture: ComponentFixture<FlChartComponentSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartComponentSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartComponentSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

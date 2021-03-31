import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartLineMultipleComponent } from './fl-chart-line-multiple.component';

describe('FlChartLineMultipleComponent', () => {
  let component: FlChartLineMultipleComponent;
  let fixture: ComponentFixture<FlChartLineMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartLineMultipleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartLineMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

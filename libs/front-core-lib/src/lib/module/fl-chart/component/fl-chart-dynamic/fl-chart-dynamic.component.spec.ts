import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartDynamicComponent } from './fl-chart-dynamic.component';

describe('FlChartDynamicComponent', () => {
  let component: FlChartDynamicComponent;
  let fixture: ComponentFixture<FlChartDynamicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartDynamicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartDynamicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

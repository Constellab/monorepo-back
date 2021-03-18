import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartLineSimpleComponent } from './fl-chart-line-simple.component';

describe('FlChartLineSimpleComponent', () => {
  let component: FlChartLineSimpleComponent;
  let fixture: ComponentFixture<FlChartLineSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartLineSimpleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartLineSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

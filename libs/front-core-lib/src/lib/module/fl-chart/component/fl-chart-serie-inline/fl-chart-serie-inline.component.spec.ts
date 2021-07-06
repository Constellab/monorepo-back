import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartSerieInlineComponent} from './fl-chart-serie-inline.component';

describe('FlChartSerieInlineComponent', () => {
  let component: FlChartSerieInlineComponent;
  let fixture: ComponentFixture<FlChartSerieInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartSerieInlineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartSerieInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

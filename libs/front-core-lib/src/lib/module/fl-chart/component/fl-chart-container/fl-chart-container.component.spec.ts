import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartContainerComponent} from './fl-chart-container.component';

describe('FlChartContainerComponent', () => {
  let component: FlChartContainerComponent;
  let fixture: ComponentFixture<FlChartContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

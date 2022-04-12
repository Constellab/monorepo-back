import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartScatterRightSectionComponent} from './fl-chart-scatter-right-section.component';

describe('FlChartScatterRightSectionComponent', () => {
  let component: FlChartScatterRightSectionComponent;
  let fixture: ComponentFixture<FlChartScatterRightSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartScatterRightSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartScatterRightSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

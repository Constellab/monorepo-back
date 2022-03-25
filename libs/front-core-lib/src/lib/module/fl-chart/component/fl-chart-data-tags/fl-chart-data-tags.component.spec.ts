import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlChartDataTagsComponent} from './fl-chart-data-tags.component';

describe('FlChartDataTagsComponent', () => {
  let component: FlChartDataTagsComponent;
  let fixture: ComponentFixture<FlChartDataTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartDataTagsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartDataTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

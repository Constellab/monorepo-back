import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartPathwayComponent } from './fl-chart-pathway.component';

describe('FlChartPathwayComponent', () => {
  let component: FlChartPathwayComponent;
  let fixture: ComponentFixture<FlChartPathwayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartPathwayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartPathwayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartPathwayNodeDetailComponent } from './fl-chart-pathway-node-detail.component';

describe('FlChartPathwayNodeDetailComponent', () => {
  let component: FlChartPathwayNodeDetailComponent;
  let fixture: ComponentFixture<FlChartPathwayNodeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartPathwayNodeDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartPathwayNodeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

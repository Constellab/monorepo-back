import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartPathwayNodeLinksComponent } from './fl-chart-pathway-node-links.component';

describe('FlChartPathwayNodeLinksComponent', () => {
  let component: FlChartPathwayNodeLinksComponent;
  let fixture: ComponentFixture<FlChartPathwayNodeLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartPathwayNodeLinksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartPathwayNodeLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

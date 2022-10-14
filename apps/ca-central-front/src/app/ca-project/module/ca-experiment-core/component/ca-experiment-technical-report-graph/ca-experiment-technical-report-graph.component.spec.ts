import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExperimentTechnicalReportGraphComponent} from './ca-experiment-technical-report-graph.component';

describe('CaExperimentTechnicalReportGraphComponent', () => {
  let component: CaExperimentTechnicalReportGraphComponent;
  let fixture: ComponentFixture<CaExperimentTechnicalReportGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaExperimentTechnicalReportGraphComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaExperimentTechnicalReportGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {
  CaExperimentTechnicalReportWorkflowDrawerComponent
} from './ca-experiment-technical-report-workflow-drawer.component';

describe('CaExperimentTechnicalReportWorkflowDrawerComponent', () => {
  let component: CaExperimentTechnicalReportWorkflowDrawerComponent;
  let fixture: ComponentFixture<CaExperimentTechnicalReportWorkflowDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaExperimentTechnicalReportWorkflowDrawerComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CaExperimentTechnicalReportWorkflowDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

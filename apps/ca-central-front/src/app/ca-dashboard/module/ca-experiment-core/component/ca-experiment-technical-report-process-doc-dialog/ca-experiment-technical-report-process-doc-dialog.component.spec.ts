import {ComponentFixture, TestBed} from '@angular/core/testing';

import {
  CaExperimentTechnicalReportProcessDocDialogComponent
} from './ca-experiment-technical-report-process-doc-dialog.component';

describe('CaExperimentTechnicalReportProcessDocComponent', () => {
  let component: CaExperimentTechnicalReportProcessDocDialogComponent;
  let fixture: ComponentFixture<CaExperimentTechnicalReportProcessDocDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaExperimentTechnicalReportProcessDocDialogComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaExperimentTechnicalReportProcessDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

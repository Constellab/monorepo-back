import {ComponentFixture, TestBed} from '@angular/core/testing';

import {
  CaExperimentTechnicalReportResourceDialogComponent
} from './ca-experiment-technical-report-resource-dialog.component';

describe('CaExperimentTechnicalReportResourceDirectiveComponent', () => {
  let component: CaExperimentTechnicalReportResourceDialogComponent;
  let fixture: ComponentFixture<CaExperimentTechnicalReportResourceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaExperimentTechnicalReportResourceDialogComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CaExperimentTechnicalReportResourceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

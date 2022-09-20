import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PrWorkflowProcessConfigInfoDialogComponent} from './pr-workflow-process-config-info-dialog.component';

describe('CaExperimentTechnicalReportConfigInfoDialogComponent', () => {
  let component: PrWorkflowProcessConfigInfoDialogComponent;
  let fixture: ComponentFixture<PrWorkflowProcessConfigInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrWorkflowProcessConfigInfoDialogComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PrWorkflowProcessConfigInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

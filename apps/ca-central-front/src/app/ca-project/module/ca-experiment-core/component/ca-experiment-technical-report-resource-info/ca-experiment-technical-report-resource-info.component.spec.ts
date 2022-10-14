import {ComponentFixture, TestBed} from '@angular/core/testing';

import {
  CaExperimentTechnicalReportResourceInfoComponent
} from './ca-experiment-technical-report-resource-info.component';

describe('CaExperimentTechnicalReportResourceInfoComponent', () => {
  let component: CaExperimentTechnicalReportResourceInfoComponent;
  let fixture: ComponentFixture<CaExperimentTechnicalReportResourceInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaExperimentTechnicalReportResourceInfoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CaExperimentTechnicalReportResourceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExperimentTechnicalReportComponent} from './ca-experiment-technical-report.component';

describe('CaExperimentTechnicalReportComponent', () => {
  let component: CaExperimentTechnicalReportComponent;
  let fixture: ComponentFixture<CaExperimentTechnicalReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaExperimentTechnicalReportComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaExperimentTechnicalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

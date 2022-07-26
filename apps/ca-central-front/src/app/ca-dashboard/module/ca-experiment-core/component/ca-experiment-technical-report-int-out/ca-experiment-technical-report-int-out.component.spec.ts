import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExperimentTechnicalReportIntOutComponent} from './ca-experiment-technical-report-int-out.component';

describe('CaExperimentTechnicalReportIntOutComponent', () => {
  let component: CaExperimentTechnicalReportIntOutComponent;
  let fixture: ComponentFixture<CaExperimentTechnicalReportIntOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaExperimentTechnicalReportIntOutComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaExperimentTechnicalReportIntOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

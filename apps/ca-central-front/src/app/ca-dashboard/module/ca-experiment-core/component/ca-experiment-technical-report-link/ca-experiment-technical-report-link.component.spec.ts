import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExperimentTechnicalReportLinkComponent} from './ca-experiment-technical-report-link.component';

describe('CaExperimentTechnicalReportLinkComponent', () => {
  let component: CaExperimentTechnicalReportLinkComponent;
  let fixture: ComponentFixture<CaExperimentTechnicalReportLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaExperimentTechnicalReportLinkComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaExperimentTechnicalReportLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

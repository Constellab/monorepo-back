import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExperimentTechnicalReportNodeComponent} from './ca-experiment-technical-report-node.component';

describe('CaExperimentTechnicalReportNodeComponent', () => {
  let component: CaExperimentTechnicalReportNodeComponent;
  let fixture: ComponentFixture<CaExperimentTechnicalReportNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaExperimentTechnicalReportNodeComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaExperimentTechnicalReportNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabReportAssociatedExperimentsComponent} from './lab-report-associated-experiments.component';

describe('LabReportAssociatedExperimentsComponent', () => {
  let component: LabReportAssociatedExperimentsComponent;
  let fixture: ComponentFixture<LabReportAssociatedExperimentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabReportAssociatedExperimentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabReportAssociatedExperimentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

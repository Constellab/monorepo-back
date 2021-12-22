import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabReportSearchComponent} from './lab-report-search.component';

describe('LabReportSearchComponent', () => {
  let component: LabReportSearchComponent;
  let fixture: ComponentFixture<LabReportSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabReportSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabReportSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

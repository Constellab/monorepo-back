import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabReportAdvancedSearchFormComponent} from './lab-report-advanced-search-form.component';

describe('LabReportAdvancedSearchFormComponent', () => {
  let component: LabReportAdvancedSearchFormComponent;
  let fixture: ComponentFixture<LabReportAdvancedSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabReportAdvancedSearchFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabReportAdvancedSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

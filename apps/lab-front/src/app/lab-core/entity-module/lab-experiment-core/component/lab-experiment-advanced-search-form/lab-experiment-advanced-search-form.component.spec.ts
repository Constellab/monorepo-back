import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentAdvancedSearchFormComponent} from './lab-experiment-advanced-search-form.component';

describe('BioxExperimentAdvancedSearchFormComponent', () => {
  let component: LabExperimentAdvancedSearchFormComponent;
  let fixture: ComponentFixture<LabExperimentAdvancedSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentAdvancedSearchFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentAdvancedSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

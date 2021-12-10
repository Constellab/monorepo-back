import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxExperimentAdvancedSearchFormComponent} from './biox-experiment-advanced-search-form.component';

describe('BioxExperimentAdvancedSearchFormComponent', () => {
  let component: BioxExperimentAdvancedSearchFormComponent;
  let fixture: ComponentFixture<BioxExperimentAdvancedSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxExperimentAdvancedSearchFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxExperimentAdvancedSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

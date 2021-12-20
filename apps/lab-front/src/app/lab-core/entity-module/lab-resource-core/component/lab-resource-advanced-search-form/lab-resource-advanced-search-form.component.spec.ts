import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceAdvancedSearchFormComponent} from './lab-resource-advanced-search-form.component';

describe('BioxResourceAdvancedSearchFormComponent', () => {
  let component: LabResourceAdvancedSearchFormComponent;
  let fixture: ComponentFixture<LabResourceAdvancedSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceAdvancedSearchFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceAdvancedSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

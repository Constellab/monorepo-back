import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTypeAdvancedSearchFormComponent} from './lab-type-advanced-search-form.component';

describe('LabTypeAdvancedSearchFormComponent', () => {
  let component: LabTypeAdvancedSearchFormComponent;
  let fixture: ComponentFixture<LabTypeAdvancedSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTypeAdvancedSearchFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTypeAdvancedSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

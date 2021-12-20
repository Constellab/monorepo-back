import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceSearchComponent} from './lab-resource-search.component';

describe('BioxResourceSearchComponent', () => {
  let component: LabResourceSearchComponent;
  let fixture: ComponentFixture<LabResourceSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

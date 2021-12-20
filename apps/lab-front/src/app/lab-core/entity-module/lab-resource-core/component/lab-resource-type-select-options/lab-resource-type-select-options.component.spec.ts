import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceTypeSelectOptionsComponent} from './lab-resource-type-select-options.component';

describe('BioxResourceTypeSelectOptionsComponent', () => {
  let component: LabResourceTypeSelectOptionsComponent;
  let fixture: ComponentFixture<LabResourceTypeSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceTypeSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceTypeSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

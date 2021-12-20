import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceSelectOptionsComponent} from './lab-resource-select-options.component';

describe('BioxResourceSelectOptionComponent', () => {
  let component: LabResourceSelectOptionsComponent;
  let fixture: ComponentFixture<LabResourceSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

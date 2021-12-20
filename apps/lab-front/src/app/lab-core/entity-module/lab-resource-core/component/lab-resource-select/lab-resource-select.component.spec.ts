import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceSelectComponent} from './lab-resource-select.component';

describe('BioxResourceSelectComponent', () => {
  let component: LabResourceSelectComponent;
  let fixture: ComponentFixture<LabResourceSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceOriginOptionsComponent} from './lab-resource-origin-options.component';

describe('BioxResourceOriginOptionsComponent', () => {
  let component: LabResourceOriginOptionsComponent;
  let fixture: ComponentFixture<LabResourceOriginOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceOriginOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceOriginOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

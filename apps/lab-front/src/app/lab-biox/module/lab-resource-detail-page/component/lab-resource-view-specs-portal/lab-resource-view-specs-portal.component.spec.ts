import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceViewSpecsPortalComponent} from './lab-resource-view-specs-portal.component';

describe('BioxResourceViewsPortalComponent', () => {
  let component: LabResourceViewSpecsPortalComponent;
  let fixture: ComponentFixture<LabResourceViewSpecsPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceViewSpecsPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceViewSpecsPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

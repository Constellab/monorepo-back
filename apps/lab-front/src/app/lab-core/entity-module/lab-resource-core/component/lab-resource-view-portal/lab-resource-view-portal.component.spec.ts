import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceViewPortalComponent} from './lab-resource-view-portal.component';

describe('BioxResourcePortalViewComponent', () => {
  let component: LabResourceViewPortalComponent;
  let fixture: ComponentFixture<LabResourceViewPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceViewPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceViewPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

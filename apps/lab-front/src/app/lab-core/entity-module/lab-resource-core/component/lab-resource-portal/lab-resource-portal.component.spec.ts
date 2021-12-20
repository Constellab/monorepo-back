import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourcePortalComponent} from './lab-resource-portal.component';

describe('BioxResourceDialogComponent', () => {
  let component: LabResourcePortalComponent;
  let fixture: ComponentFixture<LabResourcePortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourcePortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourcePortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

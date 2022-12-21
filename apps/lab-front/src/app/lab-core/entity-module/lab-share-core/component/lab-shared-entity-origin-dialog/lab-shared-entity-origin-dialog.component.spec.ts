import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSharedEntityOriginDialogComponent} from './lab-shared-entity-origin-dialog.component';

describe('LabResourceShareOriginDialogComponent', () => {
  let component: LabSharedEntityOriginDialogComponent;
  let fixture: ComponentFixture<LabSharedEntityOriginDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSharedEntityOriginDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabSharedEntityOriginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

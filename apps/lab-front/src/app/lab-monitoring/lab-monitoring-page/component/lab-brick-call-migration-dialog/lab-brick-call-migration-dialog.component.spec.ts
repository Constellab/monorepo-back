import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBrickCallMigrationDialogComponent} from './lab-brick-call-migration-dialog.component';

describe('LabBrickCallMigrationDialogComponent', () => {
  let component: LabBrickCallMigrationDialogComponent;
  let fixture: ComponentFixture<LabBrickCallMigrationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBrickCallMigrationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBrickCallMigrationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

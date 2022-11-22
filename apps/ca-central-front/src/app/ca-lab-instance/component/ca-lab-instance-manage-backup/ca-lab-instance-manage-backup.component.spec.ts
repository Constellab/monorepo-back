import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceManageBackupComponent} from './ca-lab-instance-manage-backup.component';

describe('CaLabInstanceManageBackupComponent', () => {
  let component: CaLabInstanceManageBackupComponent;
  let fixture: ComponentFixture<CaLabInstanceManageBackupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceManageBackupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceManageBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

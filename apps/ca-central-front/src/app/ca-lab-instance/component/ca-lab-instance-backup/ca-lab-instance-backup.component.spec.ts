import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceBackupComponent} from './ca-lab-instance-backup.component';

describe('CaLabInstanceBackupComponent', () => {
  let component: CaLabInstanceBackupComponent;
  let fixture: ComponentFixture<CaLabInstanceBackupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceBackupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

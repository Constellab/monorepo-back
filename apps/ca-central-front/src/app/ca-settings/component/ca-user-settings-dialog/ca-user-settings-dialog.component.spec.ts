import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaUserSettingsDialogComponent} from './ca-user-settings-dialog.component';

describe('SettingsPageComponent', () => {
  let component: CaUserSettingsDialogComponent;
  let fixture: ComponentFixture<CaUserSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaUserSettingsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaUserSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabMainMenuSettingsComponent} from './lab-main-menu-settings.component';

describe('MainMenuSettingsComponent', () => {
  let component: LabMainMenuSettingsComponent;
  let fixture: ComponentFixture<LabMainMenuSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabMainMenuSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabMainMenuSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

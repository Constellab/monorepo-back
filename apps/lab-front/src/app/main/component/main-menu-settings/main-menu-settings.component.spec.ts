import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MainMenuSettingsComponent} from './main-menu-settings.component';

describe('MainMenuSettingsComponent', () => {
  let component: MainMenuSettingsComponent;
  let fixture: ComponentFixture<MainMenuSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainMenuSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainMenuSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

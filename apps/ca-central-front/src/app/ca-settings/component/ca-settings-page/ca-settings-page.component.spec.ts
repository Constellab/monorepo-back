import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSettingsPageComponent} from './ca-settings-page.component';

describe('SettingsPageComponent', () => {
  let component: CaSettingsPageComponent;
  let fixture: ComponentFixture<CaSettingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSettingsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

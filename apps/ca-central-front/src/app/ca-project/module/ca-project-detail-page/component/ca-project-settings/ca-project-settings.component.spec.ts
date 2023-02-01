import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectSettingsComponent} from './ca-project-settings.component';

describe('CaProjectSettingsComponent', () => {
  let component: CaProjectSettingsComponent;
  let fixture: ComponentFixture<CaProjectSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

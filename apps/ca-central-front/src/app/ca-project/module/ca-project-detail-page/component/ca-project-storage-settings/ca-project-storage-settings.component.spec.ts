import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectStorageSettingsComponent} from './ca-project-storage-settings.component';

describe('CaProjectStorageSettingsComponent', () => {
  let component: CaProjectStorageSettingsComponent;
  let fixture: ComponentFixture<CaProjectStorageSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectStorageSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectStorageSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

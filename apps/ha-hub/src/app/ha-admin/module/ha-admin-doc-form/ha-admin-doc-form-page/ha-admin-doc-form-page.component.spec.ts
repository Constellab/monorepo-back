import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaAdminDocFormPageComponent } from './ha-admin-doc-form-page.component';

describe('DaAdminDocFormPageComponent', () => {
  let component: HaAdminDocFormPageComponent;
  let fixture: ComponentFixture<HaAdminDocFormPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaAdminDocFormPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaAdminDocFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

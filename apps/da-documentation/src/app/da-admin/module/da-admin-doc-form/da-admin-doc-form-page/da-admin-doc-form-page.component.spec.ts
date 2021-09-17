import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaAdminDocFormPageComponent } from './da-admin-doc-form-page.component';

describe('DaAdminDocFormPageComponent', () => {
  let component: DaAdminDocFormPageComponent;
  let fixture: ComponentFixture<DaAdminDocFormPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaAdminDocFormPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaAdminDocFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

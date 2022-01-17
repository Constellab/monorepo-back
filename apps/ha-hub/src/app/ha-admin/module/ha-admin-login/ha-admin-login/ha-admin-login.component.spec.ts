import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaAdminLoginComponent } from './ha-admin-login.component.ts';

describe('DaAdminLoginComponent', () => {
  let component: HaAdminLoginComponent;
  let fixture: ComponentFixture<HaAdminLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaAdminLoginComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaAdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

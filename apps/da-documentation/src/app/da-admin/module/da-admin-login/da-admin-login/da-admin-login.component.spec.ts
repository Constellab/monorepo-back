import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaAdminLoginComponent } from './da-admin-login.component';

describe('DaAdminLoginComponent', () => {
  let component: DaAdminLoginComponent;
  let fixture: ComponentFixture<DaAdminLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaAdminLoginComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaAdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

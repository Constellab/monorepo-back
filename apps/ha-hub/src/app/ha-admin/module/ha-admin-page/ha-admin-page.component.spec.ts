import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaAdminPageComponent } from './ha-admin-page.component';

describe('HaAdminPageComponent', () => {
  let component: HaAdminPageComponent;
  let fixture: ComponentFixture<HaAdminPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaAdminPageComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaAdminPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

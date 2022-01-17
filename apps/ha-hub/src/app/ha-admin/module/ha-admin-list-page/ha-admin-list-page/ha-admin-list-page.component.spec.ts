import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaAdminListPageComponent } from './ha-admin-list-page.component';

describe('DaAdminListPageComponent', () => {
  let component: HaAdminListPageComponent;
  let fixture: ComponentFixture<HaAdminListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaAdminListPageComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaAdminListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

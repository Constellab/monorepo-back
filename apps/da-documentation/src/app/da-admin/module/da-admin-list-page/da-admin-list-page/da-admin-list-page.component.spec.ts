import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaAdminListPageComponent } from './da-admin-list-page.component';

describe('DaAdminListPageComponent', () => {
  let component: DaAdminListPageComponent;
  let fixture: ComponentFixture<DaAdminListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaAdminListPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaAdminListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

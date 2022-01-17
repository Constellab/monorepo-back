import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicSidenavComponent } from './ha-public-sidenav.component';

describe('DaPublicSidenavComponent', () => {
  let component: HaPublicSidenavComponent;
  let fixture: ComponentFixture<HaPublicSidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicSidenavComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

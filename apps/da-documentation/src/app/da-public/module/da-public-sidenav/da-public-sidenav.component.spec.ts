import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaPublicSidenavComponent } from './da-public-sidenav.component';

describe('DaPublicSidenavComponent', () => {
  let component: DaPublicSidenavComponent;
  let fixture: ComponentFixture<DaPublicSidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaPublicSidenavComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaPublicSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

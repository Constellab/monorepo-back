import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicEditBrickPageComponent } from './ha-public-edit-brick-page.component';

describe('HaPublicEditBrickPageComponent', () => {
  let component: HaPublicEditBrickPageComponent;
  let fixture: ComponentFixture<HaPublicEditBrickPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicEditBrickPageComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicEditBrickPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

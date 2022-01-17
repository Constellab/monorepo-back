import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicBrickPageComponent } from './ha-public-brick-page.component';

describe('DaPublicListBricksPageComponent', () => {
  let component: HaPublicBrickPageComponent;
  let fixture: ComponentFixture<HaPublicBrickPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicBrickPageComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicBrickPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

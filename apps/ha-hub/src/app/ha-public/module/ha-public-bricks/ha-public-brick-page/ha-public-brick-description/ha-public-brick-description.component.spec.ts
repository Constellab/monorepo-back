import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicBrickDescriptionComponent } from './ha-public-brick-description.component';

describe('HaPublicBrickDescriptionPageComponent', () => {
  let component: HaPublicBrickDescriptionComponent;
  let fixture: ComponentFixture<HaPublicBrickDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicBrickDescriptionComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicBrickDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicBrickDescriptionPageComponent } from './ha-public-brick-description-page.component';

describe('HaPublicBrickDescriptionPageComponent', () => {
  let component: HaPublicBrickDescriptionPageComponent;
  let fixture: ComponentFixture<HaPublicBrickDescriptionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicBrickDescriptionPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicBrickDescriptionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

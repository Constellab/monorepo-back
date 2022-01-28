import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicEditBrickFormComponent } from './ha-public-edit-brick-form.component';

describe('HaPublicEditBrickFormComponent', () => {
  let component: HaPublicEditBrickFormComponent;
  let fixture: ComponentFixture<HaPublicEditBrickFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicEditBrickFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicEditBrickFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

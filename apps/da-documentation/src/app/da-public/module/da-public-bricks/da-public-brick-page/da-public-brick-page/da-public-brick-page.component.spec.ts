import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaPublicBrickPageComponent } from './da-public-brick-page.component';

describe('DaPublicListBricksPageComponent', () => {
  let component: DaPublicBrickPageComponent;
  let fixture: ComponentFixture<DaPublicBrickPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaPublicBrickPageComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaPublicBrickPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

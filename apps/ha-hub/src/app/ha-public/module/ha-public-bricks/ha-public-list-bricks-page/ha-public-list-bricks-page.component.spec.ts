import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicListBricksPageComponent } from './ha-public-list-bricks-page.component';

describe('DaPublicListBricksPageComponent', () => {
  let component: HaPublicListBricksPageComponent;
  let fixture: ComponentFixture<HaPublicListBricksPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicListBricksPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicListBricksPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

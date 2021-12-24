import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaPublicListBricksPageComponent } from './da-public-list-bricks-page.component';

describe('DaPublicListBricksPageComponent', () => {
  let component: DaPublicListBricksPageComponent;
  let fixture: ComponentFixture<DaPublicListBricksPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaPublicListBricksPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaPublicListBricksPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaStoryPageComponent } from './ha-story-page.component';

describe('HaStoryPageComponent', () => {
  let component: HaStoryPageComponent;
  let fixture: ComponentFixture<HaStoryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaStoryPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaStoryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

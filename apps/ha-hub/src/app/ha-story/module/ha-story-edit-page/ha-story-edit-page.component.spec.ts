import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaStoryEditPageComponent } from './ha-story-edit-page.component';

describe('HaStoryEditPageComponent', () => {
  let component: HaStoryEditPageComponent;
  let fixture: ComponentFixture<HaStoryEditPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaStoryEditPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaStoryEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

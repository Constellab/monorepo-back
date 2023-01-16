import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaStoryListPageComponent } from './ha-story-list-page.component';

describe('HaStoryListPageComponent', () => {
  let component: HaStoryListPageComponent;
  let fixture: ComponentFixture<HaStoryListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaStoryListPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaStoryListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

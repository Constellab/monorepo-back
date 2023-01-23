import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaStoryMyListComponent } from './ha-story-my-list.component';

describe('HaStoryMyListComponent', () => {
  let component: HaStoryMyListComponent;
  let fixture: ComponentFixture<HaStoryMyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaStoryMyListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaStoryMyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

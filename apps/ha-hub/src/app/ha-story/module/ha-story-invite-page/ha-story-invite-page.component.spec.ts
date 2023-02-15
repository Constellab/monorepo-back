import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaStoryInvitePageComponent } from './ha-story-invite-page.component';

describe('HaStoryInvitePageComponent', () => {
  let component: HaStoryInvitePageComponent;
  let fixture: ComponentFixture<HaStoryInvitePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaStoryInvitePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaStoryInvitePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

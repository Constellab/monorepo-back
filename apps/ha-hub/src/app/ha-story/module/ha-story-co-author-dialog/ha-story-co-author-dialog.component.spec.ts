import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaStoryCoAuthorDialogComponent } from './ha-story-co-author-dialog.component';

describe('HaStoryCoAuthorDialogComponent', () => {
  let component: HaStoryCoAuthorDialogComponent;
  let fixture: ComponentFixture<HaStoryCoAuthorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaStoryCoAuthorDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaStoryCoAuthorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

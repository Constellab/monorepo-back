import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlEmojiPickerPortalComponent } from './fl-emoji-picker-portal.component';

describe('FlEmojiPickerComponent', () => {
  let component: FlEmojiPickerPortalComponent;
  let fixture: ComponentFixture<FlEmojiPickerPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlEmojiPickerPortalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlEmojiPickerPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

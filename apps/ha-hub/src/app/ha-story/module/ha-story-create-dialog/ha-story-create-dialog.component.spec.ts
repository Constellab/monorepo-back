import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HaStoryCreateDialogComponent} from './ha-story-create-dialog.component';

describe('HaStoryCreateDialogComponent', () => {
  let component: HaStoryCreateDialogComponent;
  let fixture: ComponentFixture<HaStoryCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HaStoryCreateDialogComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HaStoryCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

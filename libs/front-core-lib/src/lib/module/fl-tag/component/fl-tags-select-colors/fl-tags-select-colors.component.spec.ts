import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTagsSelectColorsComponent} from './fl-tags-select-colors.component';

describe('FlTagsColorFiltersComponent', () => {
  let component: FlTagsSelectColorsComponent;
  let fixture: ComponentFixture<FlTagsSelectColorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTagsSelectColorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTagsSelectColorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

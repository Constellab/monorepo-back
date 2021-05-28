import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSelectUserCategoryOptionComponent} from './fl-select-user-category-option.component';

describe('SelectUserCategoryOptionComponent', () => {
  let component: FlSelectUserCategoryOptionComponent;
  let fixture: ComponentFixture<FlSelectUserCategoryOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSelectUserCategoryOptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSelectUserCategoryOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

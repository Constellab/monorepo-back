import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectUserCategoryOptionComponent} from './select-user-category-option.component';

describe('SelectUserCategoryOptionComponent', () => {
  let component: SelectUserCategoryOptionComponent;
  let fixture: ComponentFixture<SelectUserCategoryOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectUserCategoryOptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectUserCategoryOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

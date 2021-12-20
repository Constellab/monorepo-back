import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectUserCategoryOptionComponent} from './ca-select-user-category-option.component';

describe('SelectUserCategoryOptionComponent', () => {
  let component: CaSelectUserCategoryOptionComponent;
  let fixture: ComponentFixture<CaSelectUserCategoryOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectUserCategoryOptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSelectUserCategoryOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

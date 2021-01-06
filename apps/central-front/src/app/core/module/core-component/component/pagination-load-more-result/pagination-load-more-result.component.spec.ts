import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PaginationLoadMoreResultComponent} from './pagination-load-more-result.component';

describe('LoadMoreResultComponent', () => {
  let component: PaginationLoadMoreResultComponent;
  let fixture: ComponentFixture<PaginationLoadMoreResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaginationLoadMoreResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginationLoadMoreResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

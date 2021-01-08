import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FlPaginationLoadMoreResultComponent} from './fl-pagination-load-more-result.component';

describe('LoadMoreResultComponent', () => {
  let component: FlPaginationLoadMoreResultComponent;
  let fixture: ComponentFixture<FlPaginationLoadMoreResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlPaginationLoadMoreResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPaginationLoadMoreResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

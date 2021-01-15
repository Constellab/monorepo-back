import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FlInfiniteLoadMoreResultComponent} from './fl-infinite-load-more-result.component';

describe('LoadMoreResultComponent', () => {
  let component: FlInfiniteLoadMoreResultComponent;
  let fixture: ComponentFixture<FlInfiniteLoadMoreResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlInfiniteLoadMoreResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlInfiniteLoadMoreResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlInfiniteScrollComponent } from './fl-infinite-scroll.component';

describe('FlInfiniteScrollComponent', () => {
  let component: FlInfiniteScrollComponent;
  let fixture: ComponentFixture<FlInfiniteScrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlInfiniteScrollComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlInfiniteScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

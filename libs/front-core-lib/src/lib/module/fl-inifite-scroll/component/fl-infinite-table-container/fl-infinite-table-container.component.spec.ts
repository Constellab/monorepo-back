import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlInfiniteTableContainerComponent} from './fl-infinite-table-container.component';

describe('FlInifiniteTableContainerComponent', () => {
  let component: FlInfiniteTableContainerComponent;
  let fixture: ComponentFixture<FlInfiniteTableContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlInfiniteTableContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlInfiniteTableContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

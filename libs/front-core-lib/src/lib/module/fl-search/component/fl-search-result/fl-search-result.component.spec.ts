import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSearchResultComponent} from './fl-search-result.component';

describe('FlSearchResultComponent', () => {
  let component: FlSearchResultComponent;
  let fixture: ComponentFixture<FlSearchResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSearchResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSearchSavedListComponent} from './fl-search-saved-list.component';

describe('FlSearchSavedListComponent', () => {
  let component: FlSearchSavedListComponent;
  let fixture: ComponentFixture<FlSearchSavedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSearchSavedListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSearchSavedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

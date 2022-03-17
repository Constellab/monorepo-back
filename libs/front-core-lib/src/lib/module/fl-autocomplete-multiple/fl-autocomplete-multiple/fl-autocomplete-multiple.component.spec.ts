import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlAutocompleteMultipleComponent} from './fl-autocomplete-multiple.component';

describe('FlAutocompleteMultipleComponent', () => {
  let component: FlAutocompleteMultipleComponent;
  let fixture: ComponentFixture<FlAutocompleteMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlAutocompleteMultipleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlAutocompleteMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

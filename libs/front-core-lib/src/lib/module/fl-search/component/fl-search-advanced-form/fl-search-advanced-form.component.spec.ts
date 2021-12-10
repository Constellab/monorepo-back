import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSearchAdvancedFormComponent} from './fl-search-advanced-form.component';

describe('FlSearchAdvancedSearchFormComponent', () => {
  let component: FlSearchAdvancedFormComponent;
  let fixture: ComponentFixture<FlSearchAdvancedFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSearchAdvancedFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSearchAdvancedFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

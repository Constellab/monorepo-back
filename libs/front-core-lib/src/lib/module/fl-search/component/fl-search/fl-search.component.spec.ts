import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSearchComponent} from './fl-search.component';

describe('FlSearchComponent', () => {
  let component: FlSearchComponent;
  let fixture: ComponentFixture<FlSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

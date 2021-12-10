import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSearchHeaderComponent} from './fl-search-header.component';

describe('FlSearchHeaderComponent', () => {
  let component: FlSearchHeaderComponent;
  let fixture: ComponentFixture<FlSearchHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSearchHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSearchHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

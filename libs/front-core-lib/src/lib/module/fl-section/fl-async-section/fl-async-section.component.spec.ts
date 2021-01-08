import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlAsyncSectionComponent} from './fl-async-section.component';

describe('AsyncSectionComponent', () => {
  let component: FlAsyncSectionComponent;
  let fixture: ComponentFixture<FlAsyncSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlAsyncSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlAsyncSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

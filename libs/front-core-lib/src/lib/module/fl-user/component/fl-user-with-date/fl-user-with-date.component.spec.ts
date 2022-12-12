import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlUserWithDateComponent} from './fl-user-with-date.component';

describe('FlUserWithDateComponent', () => {
  let component: FlUserWithDateComponent;
  let fixture: ComponentFixture<FlUserWithDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlUserWithDateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlUserWithDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

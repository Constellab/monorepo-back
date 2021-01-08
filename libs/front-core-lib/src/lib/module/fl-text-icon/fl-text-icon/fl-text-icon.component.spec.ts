import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlTextIconComponent} from './fl-text-icon.component';

describe('LibTextIconComponent', () => {
  let component: FlTextIconComponent;
  let fixture: ComponentFixture<FlTextIconComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlTextIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTextIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

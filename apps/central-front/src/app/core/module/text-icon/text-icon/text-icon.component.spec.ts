import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {TextIconComponent} from './text-icon.component';

describe('LibTextIconComponent', () => {
  let component: TextIconComponent;
  let fixture: ComponentFixture<TextIconComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TextIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

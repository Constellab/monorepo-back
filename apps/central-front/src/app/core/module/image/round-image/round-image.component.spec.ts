import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {RoundImageComponent} from './round-image.component';

describe('LibRoundImageComponent', () => {
  let component: RoundImageComponent;
  let fixture: ComponentFixture<RoundImageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

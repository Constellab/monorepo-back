import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxProcessCardComponent } from './biox-process-card.component';

describe('BioxProcessCardComponent', () => {
  let component: BioxProcessCardComponent;
  let fixture: ComponentFixture<BioxProcessCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxProcessTypeCardComponent } from './biox-process-type-card.component';

describe('BioxProcessTypeCardComponent', () => {
  let component: BioxProcessTypeCardComponent;
  let fixture: ComponentFixture<BioxProcessTypeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessTypeCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessTypeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

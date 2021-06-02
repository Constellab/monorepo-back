import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxProcessPortComponent } from './biox-process-port.component';

describe('BioxProcessPortComponent', () => {
  let component: BioxProcessPortComponent;
  let fixture: ComponentFixture<BioxProcessPortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessPortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessPortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProcessablePortComponent} from './biox-processable-port.component';

describe('BioxProcessPortComponent', () => {
  let component: BioxProcessablePortComponent;
  let fixture: ComponentFixture<BioxProcessablePortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessablePortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessablePortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

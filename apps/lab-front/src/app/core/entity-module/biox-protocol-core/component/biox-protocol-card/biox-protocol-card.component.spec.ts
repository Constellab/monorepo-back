import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxProtocolCardComponent } from './biox-protocol-card.component';

describe('BioxProtocolCardComponent', () => {
  let component: BioxProtocolCardComponent;
  let fixture: ComponentFixture<BioxProtocolCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProtocolCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProtocolCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

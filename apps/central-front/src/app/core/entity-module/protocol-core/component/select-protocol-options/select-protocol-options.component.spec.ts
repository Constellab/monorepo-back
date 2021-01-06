import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectProtocolOptionsComponent} from './select-protocol-options.component';

describe('ProtocolSelectOptionsComponent', () => {
  let component: SelectProtocolOptionsComponent;
  let fixture: ComponentFixture<SelectProtocolOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectProtocolOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectProtocolOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

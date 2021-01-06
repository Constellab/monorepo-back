import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProtocolJsonComponent} from './protocol-json.component';

describe('ProtocolJsonComponent', () => {
  let component: ProtocolJsonComponent;
  let fixture: ComponentFixture<ProtocolJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProtocolJsonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

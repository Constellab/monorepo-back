import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProtocolCardDetailComponent} from './protocol-card-detail.component';

describe('ProtocolCardDetailComponent', () => {
  let component: ProtocolCardDetailComponent;
  let fixture: ComponentFixture<ProtocolCardDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProtocolCardDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolCardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProtocolDetailPageComponent} from './protocol-detail-page.component';

describe('ProtocolDetailPageComponent', () => {
  let component: ProtocolDetailPageComponent;
  let fixture: ComponentFixture<ProtocolDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProtocolDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

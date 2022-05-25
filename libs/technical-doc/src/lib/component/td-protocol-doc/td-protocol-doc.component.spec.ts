import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdProtocolDocComponent} from './td-protocol-doc.component';

describe('TdProtocolDocViewComponent', () => {
  let component: TdProtocolDocComponent;
  let fixture: ComponentFixture<TdProtocolDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdProtocolDocComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdProtocolDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdProtocolDocViewComponent} from './td-protocol-doc-view.component';

describe('TdProtocolDocViewComponent', () => {
  let component: TdProtocolDocViewComponent;
  let fixture: ComponentFixture<TdProtocolDocViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TdProtocolDocViewComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdProtocolDocViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

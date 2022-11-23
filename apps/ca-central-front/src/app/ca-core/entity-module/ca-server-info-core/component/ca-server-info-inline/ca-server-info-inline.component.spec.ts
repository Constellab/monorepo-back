import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaServerInfoInlineComponent} from './ca-server-info-inline.component';

describe('CaServerInfoInlineComponent', () => {
  let component: CaServerInfoInlineComponent;
  let fixture: ComponentFixture<CaServerInfoInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaServerInfoInlineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaServerInfoInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

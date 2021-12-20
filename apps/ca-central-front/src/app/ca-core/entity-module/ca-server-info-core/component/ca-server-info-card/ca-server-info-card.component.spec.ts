import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaServerInfoCardComponent} from './ca-server-info-card.component';

describe('ServerInfoCardComponent', () => {
  let component: CaServerInfoCardComponent;
  let fixture: ComponentFixture<CaServerInfoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaServerInfoCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaServerInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

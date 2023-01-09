import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaServerInfoDetailComponent} from './ca-server-info-detail.component';

describe('ServerInfoCardComponent', () => {
  let component: CaServerInfoDetailComponent;
  let fixture: ComponentFixture<CaServerInfoDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaServerInfoDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaServerInfoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaServerInfoTableComponent} from './ca-server-info-table.component';

describe('ServerInfoTableComponent', () => {
  let component: CaServerInfoTableComponent;
  let fixture: ComponentFixture<CaServerInfoTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaServerInfoTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaServerInfoTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

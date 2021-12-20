import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectServerInfoHostOptionsComponent} from './ca-select-server-info-host-options.component';

describe('ServerInfoHostSelectOptionsComponent', () => {
  let component: CaSelectServerInfoHostOptionsComponent;
  let fixture: ComponentFixture<CaSelectServerInfoHostOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectServerInfoHostOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSelectServerInfoHostOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

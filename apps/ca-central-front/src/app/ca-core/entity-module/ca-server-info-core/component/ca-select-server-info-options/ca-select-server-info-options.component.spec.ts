import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectServerInfoOptionsComponent} from './ca-select-server-info-options.component';

describe('ServerInfoSelectOptionsComponent', () => {
  let component: CaSelectServerInfoOptionsComponent;
  let fixture: ComponentFixture<CaSelectServerInfoOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectServerInfoOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSelectServerInfoOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectServerInfoHostOptionsComponent} from './select-server-info-host-options.component';

describe('ServerInfoHostSelectOptionsComponent', () => {
  let component: SelectServerInfoHostOptionsComponent;
  let fixture: ComponentFixture<SelectServerInfoHostOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectServerInfoHostOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectServerInfoHostOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

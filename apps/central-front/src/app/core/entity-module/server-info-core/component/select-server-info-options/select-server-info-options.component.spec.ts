import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectServerInfoOptionsComponent} from './select-server-info-options.component';

describe('ServerInfoSelectOptionsComponent', () => {
  let component: SelectServerInfoOptionsComponent;
  let fixture: ComponentFixture<SelectServerInfoOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectServerInfoOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectServerInfoOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

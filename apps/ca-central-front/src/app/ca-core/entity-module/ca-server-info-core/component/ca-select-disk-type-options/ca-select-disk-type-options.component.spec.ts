import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectDiskTypeOptionsComponent} from './ca-select-disk-type-options.component';

describe('ServerInfoDiskTypeSelectOptionsComponent', () => {
  let component: CaSelectDiskTypeOptionsComponent;
  let fixture: ComponentFixture<CaSelectDiskTypeOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectDiskTypeOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSelectDiskTypeOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

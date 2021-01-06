import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectDiskTypeOptionsComponent} from './select-disk-type-options.component';

describe('ServerInfoDiskTypeSelectOptionsComponent', () => {
  let component: SelectDiskTypeOptionsComponent;
  let fixture: ComponentFixture<SelectDiskTypeOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectDiskTypeOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDiskTypeOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

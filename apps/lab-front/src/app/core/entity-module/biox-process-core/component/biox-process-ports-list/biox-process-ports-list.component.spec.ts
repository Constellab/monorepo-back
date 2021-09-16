import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProcessPortsListComponent} from './biox-process-ports-list.component';

describe('BioxProcessPortsListComponent', () => {
  let component: BioxProcessPortsListComponent;
  let fixture: ComponentFixture<BioxProcessPortsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessPortsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessPortsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

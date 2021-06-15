import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProcessablePortsListComponent} from './biox-processable-ports-list.component';

describe('BioxProcessPortsListComponent', () => {
  let component: BioxProcessablePortsListComponent;
  let fixture: ComponentFixture<BioxProcessablePortsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessablePortsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessablePortsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

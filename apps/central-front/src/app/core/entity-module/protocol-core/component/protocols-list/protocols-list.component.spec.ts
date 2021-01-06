import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProtocolsListComponent} from './protocols-list.component';

describe('ProtocolsListComponent', () => {
  let component: ProtocolsListComponent;
  let fixture: ComponentFixture<ProtocolsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProtocolsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

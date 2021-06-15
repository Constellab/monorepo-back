import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProtocolTypeListComponent} from './biox-protocol-type-list.component';

describe('BioxProtocolTypeListComponent', () => {
  let component: BioxProtocolTypeListComponent;
  let fixture: ComponentFixture<BioxProtocolTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProtocolTypeListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProtocolTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

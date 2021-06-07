import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxResourceNetworkComponent} from './biox-resource-network.component';

describe('BioxResourceNetworkComponent', () => {
  let component: BioxResourceNetworkComponent;
  let fixture: ComponentFixture<BioxResourceNetworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceNetworkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

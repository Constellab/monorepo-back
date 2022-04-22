import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RvViewNetworkComponent} from './rv-view-network.component';

describe('BioxResourceNetworkComponent', () => {
  let component: RvViewNetworkComponent;
  let fixture: ComponentFixture<RvViewNetworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RvViewNetworkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RvViewNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

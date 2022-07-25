import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSyncObjectInfoComponent} from './ca-sync-object-info.component';

describe('CaSyncObjectInfoComponent', () => {
  let component: CaSyncObjectInfoComponent;
  let fixture: ComponentFixture<CaSyncObjectInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSyncObjectInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSyncObjectInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

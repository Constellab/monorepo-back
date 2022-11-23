import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminServersPageComponent} from './ca-admin-servers-page.component';

describe('CaAdminServersPageComponent', () => {
  let component: CaAdminServersPageComponent;
  let fixture: ComponentFixture<CaAdminServersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminServersPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaAdminServersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

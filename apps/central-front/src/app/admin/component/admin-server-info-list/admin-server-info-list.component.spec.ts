import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AdminServerInfoListComponent} from './admin-server-info-list.component';

describe('AdminServerInfoListComponent', () => {
  let component: AdminServerInfoListComponent;
  let fixture: ComponentFixture<AdminServerInfoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminServerInfoListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminServerInfoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

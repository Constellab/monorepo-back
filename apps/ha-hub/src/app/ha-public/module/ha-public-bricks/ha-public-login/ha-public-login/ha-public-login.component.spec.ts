import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HaPublicLoginComponent} from './ha-public-login.component';


describe('DaAdminLoginComponent', () => {
  let component: HaPublicLoginComponent;
  let fixture: ComponentFixture<HaPublicLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HaPublicLoginComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

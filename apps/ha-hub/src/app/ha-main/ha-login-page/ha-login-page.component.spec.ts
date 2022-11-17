import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HaLoginPageComponent} from './ha-login-page.component';


describe('DaAdminLoginComponent', () => {
  let component: HaLoginPageComponent;
  let fixture: ComponentFixture<HaLoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HaLoginPageComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaLoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

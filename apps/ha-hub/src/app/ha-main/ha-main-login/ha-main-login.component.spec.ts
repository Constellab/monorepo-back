import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HaMainLoginComponent} from './ha-main-login.component';


describe('DaAdminLoginComponent', () => {
  let component: HaMainLoginComponent;
  let fixture: ComponentFixture<HaMainLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HaMainLoginComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaMainLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

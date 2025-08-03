import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuGameplayComponent } from './menu-gameplay.component';

describe('MenuGameplayComponent', () => {
  let component: MenuGameplayComponent;
  let fixture: ComponentFixture<MenuGameplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MenuGameplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuGameplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
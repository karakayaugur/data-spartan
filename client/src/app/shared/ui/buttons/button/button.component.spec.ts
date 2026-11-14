import { FocusMonitor } from "@angular/cdk/a11y";
import { TestBed } from "@angular/core/testing";
import { ButtonComponent } from "./button.component";

describe("ButtonComponent focus", () => {
  it("removes the native ring on mouse focus and keeps a keyboard focus ring", () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    const monitor = TestBed.inject(FocusMonitor);
    monitor.focusVia(button, "mouse");
    expect(getComputedStyle(button).outlineStyle).toBe("none");
    button.blur();
    monitor.focusVia(button, "keyboard");
    expect(button.classList.contains("cdk-keyboard-focused")).toBeTrue();
    expect(getComputedStyle(button).outlineStyle).toBe("solid");
  });
});

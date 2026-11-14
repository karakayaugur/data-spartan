import { TestBed } from "@angular/core/testing";
import { provideLucideIcons, LucideClock, LucideX } from "@lucide/angular";
import { InputTimeComponent } from "./input-time.component";

describe("InputTimeComponent time mode", () => {
  it("selects time in a themed popup and validates HH:mm", () => {
    TestBed.configureTestingModule({ providers: [provideLucideIcons(LucideX, LucideClock)] });
    const fixture = TestBed.createComponent(InputTimeComponent);
    fixture.componentRef.setInput("inputId", "test-time");
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector("input[type=time]")).toBeNull();
    expect(fixture.componentInstance.validate()).toBeFalse();
    (root.querySelector(".time-toggle") as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe("00:00");
    expect(root.querySelector(".time-confirm")).toBeNull();
    const groups = root.querySelectorAll(".time-options");
    expect(groups[1].querySelectorAll("button").length).toBe(12);
    ["23", "55"].forEach((value, index) => {
      Array.from(groups[index].querySelectorAll<HTMLButtonElement>("button"))
        .find((button) => button.textContent?.trim() === value)!
        .click();
    });
    fixture.detectChanges();
    expect(root.querySelectorAll(".time-option.selected").length).toBe(2);
    expect(fixture.componentInstance.value()).toBe("23:55");
    (root.querySelector(".time-toggle") as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe("23:55");
    expect(root.querySelector(".time-dropdown")).toBeNull();
    expect(fixture.componentInstance.validate()).toBeTrue();
    for (const value of ["24:00", "12:60", "2026-11-13"]) {
      fixture.componentInstance.value.set(value);
      expect(fixture.componentInstance.validate()).toBeFalse();
    }
  });
  it("commits typed time, snaps to five minutes and reverts invalid text", () => {
    TestBed.configureTestingModule({ providers: [provideLucideIcons(LucideX, LucideClock)] });
    const fixture = TestBed.createComponent(InputTimeComponent);
    fixture.componentRef.setInput("inputId", "typed-time");
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(".time-input") as HTMLInputElement;
    for (const [text, expected] of [
      ["930", "09:30"],
      ["14:32", "14:30"],
      ["2:30 pm", "14:30"],
      ["12:00 am", "00:00"],
      ["23:59", "00:00"],
      ["invalid", "00:00"],
      ["24:00", "00:00"],
    ]) {
      input.value = text;
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();
      input.dispatchEvent(new Event("blur"));
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).withContext(text).toBe(expected);
      expect(input.value).withContext(text).toBe(expected);
    }
    input.value = "1435";
    input.dispatchEvent(new Event("input"));
    const enter = new KeyboardEvent("keydown", { key: "Enter", cancelable: true });
    input.dispatchEvent(enter);
    fixture.detectChanges();
    expect(enter.defaultPrevented).toBeTrue();
    expect(fixture.componentInstance.value()).toBe("14:35");
  });
});

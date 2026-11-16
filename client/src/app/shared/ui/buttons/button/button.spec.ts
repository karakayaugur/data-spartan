import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LucideLoaderCircle, LucideX, provideLucideIcons } from "@lucide/angular";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Button, ButtonSize } from "./button";

describe("Button", () => {
  let fixture: ComponentFixture<Button>;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
      providers: [provideLucideIcons(LucideLoaderCircle, LucideX)],
    }).compileComponents();
    fixture = TestBed.createComponent(Button);
    await fixture.whenStable();
    button = fixture.nativeElement.querySelector("button");
  });

  it("renders the default label and non-submit button type", () => {
    expect(button.textContent?.trim()).toBe("Submit");
    expect(button.type).toBe("button");
    expect(button.disabled).toBe(false);
    expect(button.getAttribute("data-size")).toBe("medium");
    expect(fixture.nativeElement.classList.contains("button--block")).toBe(false);
  });

  it("adds and removes the host block class when the input changes", async () => {
    fixture.componentRef.setInput("block", true);
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains("button--block")).toBe(true);
    fixture.componentRef.setInput("block", false);
    await fixture.whenStable();
    expect(fixture.nativeElement.classList.contains("button--block")).toBe(false);
  });

  it("shows the loading label and spinner, then restores the regular label", async () => {
    fixture.componentRef.setInput("label", "Kaydet");
    fixture.componentRef.setInput("loadingLabel", "Kaydediliyor...");
    fixture.componentRef.setInput("loading", true);
    await fixture.whenStable();
    expect(button.textContent?.trim()).toBe("Kaydediliyor...");
    expect(button.querySelector(".button__spinner")).not.toBeNull();
    expect(button.getAttribute("aria-busy")).toBe("true");
    fixture.componentRef.setInput("loading", false);
    await fixture.whenStable();
    expect(button.textContent?.trim()).toBe("Kaydet");
    expect(button.querySelector(".button__spinner")).toBeNull();
    expect(button.hasAttribute("aria-busy")).toBe(false);
    expect(button.disabled).toBe(false);
  });

  it("keeps the regular label while loading when no loading label is provided", async () => {
    fixture.componentRef.setInput("label", "Kaydet");
    fixture.componentRef.setInput("loading", true);
    await fixture.whenStable();
    expect(button.textContent?.trim()).toBe("Kaydet");
  });

  it.each<[ButtonSize, number]>([
    ["small", 10],
    ["medium", 12],
    ["large", 14],
  ])("renders a %s icon at %i pixels", async (size, pixels) => {
    fixture.componentRef.setInput("icon", "x");
    fixture.componentRef.setInput("size", size);
    await fixture.whenStable();
    expect(button.querySelector("svg")?.getAttribute("width")).toBe(String(pixels));
    expect(button.querySelector("svg")?.getAttribute("height")).toBe(String(pixels));
  });

  it("emits clicked once when the native button is clicked", () => {
    const clicked = vi.fn();
    fixture.componentInstance.clicked.subscribe(clicked);
    button.click();
    expect(clicked).toHaveBeenCalledOnce();
  });

  it.each(["disabled", "loading"])(
    "blocks native clicks while %s and allows clicks afterward",
    async (input) => {
      const clicked = vi.fn();
      fixture.componentInstance.clicked.subscribe(clicked);
      fixture.componentRef.setInput(input, true);
      await fixture.whenStable();
      expect(button.disabled).toBe(true);
      button.click();
      expect(clicked).not.toHaveBeenCalled();
      fixture.componentRef.setInput(input, false);
      await fixture.whenStable();
      button.click();
      expect(clicked).toHaveBeenCalledOnce();
    },
  );

  it("preserves the accessible name in icon-only mode", async () => {
    fixture.componentRef.setInput("icon", "x");
    fixture.componentRef.setInput("iconOnly", true);
    fixture.componentRef.setInput("label", "Kapat");
    await fixture.whenStable();
    expect(button.querySelector(".button__label")).toBeNull();
    expect(button.getAttribute("aria-label")).toBe("Kapat");
    fixture.componentRef.setInput("ariaLabel", "Menüyü kapat");
    await fixture.whenStable();
    expect(button.getAttribute("aria-label")).toBe("Menüyü kapat");
  });
});

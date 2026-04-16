import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createColorStore, DEFAULT_COLOR, useColorState } from "./color";

describe("createColorStore", () => {
  it("starts with the default color when no initial color is given", () => {
    const store = createColorStore();
    expect(store.getActiveColor()).toBe(DEFAULT_COLOR);
  });

  it("starts with the provided initial color", () => {
    const store = createColorStore("#ff0000");
    expect(store.getActiveColor()).toBe("#ff0000");
  });

  it("allows setting the active color to any arbitrary value", () => {
    const store = createColorStore();
    const values = ["#abc123", "rgb(10, 20, 30)", "hsl(120, 50%, 50%)", "red", "transparent"];
    for (const color of values) {
      store.setActiveColor(color);
      expect(store.getActiveColor()).toBe(color);
    }
  });

  it("trims whitespace from color values", () => {
    const store = createColorStore();
    store.setActiveColor("  #ffffff  ");
    expect(store.getActiveColor()).toBe("#ffffff");
  });

  it("throws when given an empty string", () => {
    const store = createColorStore();
    expect(() => store.setActiveColor("")).toThrow();
    expect(() => store.setActiveColor("   ")).toThrow();
  });

  it("does not retroactively change a color captured before update", () => {
    const store = createColorStore("#111111");
    const colorAtFillTime = store.getActiveColor();
    store.setActiveColor("#222222");
    expect(colorAtFillTime).toBe("#111111");
    expect(store.getActiveColor()).toBe("#222222");
  });

  it("notifies subscribers when the color changes", () => {
    const store = createColorStore("#000000");
    const listener = vi.fn();
    store.subscribe(listener);
    store.setActiveColor("#ff0000");
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith("#ff0000");
  });

  it("stops notifying after unsubscribe", () => {
    const store = createColorStore("#000000");
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setActiveColor("#ff0000");
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("useColorState", () => {
  it("returns DEFAULT_COLOR as initial active color", () => {
    const { result } = renderHook(() => useColorState());
    expect(result.current.activeColor).toBe(DEFAULT_COLOR);
  });

  it("returns the provided initial color", () => {
    const { result } = renderHook(() => useColorState("#cafebb"));
    expect(result.current.activeColor).toBe("#cafebb");
  });

  it("updates the active color when setActiveColor is called", () => {
    const { result } = renderHook(() => useColorState());
    act(() => {
      result.current.setActiveColor("#123456");
    });
    expect(result.current.activeColor).toBe("#123456");
  });

  it("accepts any CSS color string (full color space)", () => {
    const { result } = renderHook(() => useColorState());
    const colors = ["#abc", "rgba(0,0,0,0.5)", "hsl(0,100%,50%)", "blue", "transparent"];
    for (const color of colors) {
      act(() => {
        result.current.setActiveColor(color);
      });
      expect(result.current.activeColor).toBe(color);
    }
  });

  it("does not retroactively change previously captured fill colors", () => {
    const { result } = renderHook(() => useColorState("#aaaaaa"));
    const colorAtFillTime = result.current.activeColor;
    act(() => {
      result.current.setActiveColor("#bbbbbb");
    });
    expect(colorAtFillTime).toBe("#aaaaaa");
    expect(result.current.activeColor).toBe("#bbbbbb");
  });

  it("throws when setActiveColor receives an empty string", () => {
    const { result } = renderHook(() => useColorState());
    expect(() => {
      act(() => {
        result.current.setActiveColor("");
      });
    }).toThrow();
  });

  it("exposes activeColor for visual indication", () => {
    const { result } = renderHook(() => useColorState("#ff6600"));
    expect(result.current.activeColor).toBe("#ff6600");
  });
});

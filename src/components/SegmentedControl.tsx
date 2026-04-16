interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex((o) => o.value === value);
  const containerClass = size === "sm" ? "segmented-control-sm" : "segmented-control";

  return (
    <div className={containerClass}>
      <div
        className="segment-pill"
        style={{
          left: `${activeIndex * (100 / options.length)}%`,
          width: `${100 / options.length}%`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          className={`segment${option.value === value ? " segment-active" : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

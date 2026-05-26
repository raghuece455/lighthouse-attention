import { TooltipLabel } from "./Tooltip";

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  tooltip: string;
  onChange: (value: number) => void;
};

export function Slider({ label, value, min, max, step = 1, tooltip, onChange }: SliderProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-200">
        <TooltipLabel text={tooltip}>{label}</TooltipLabel>
        <span className="rounded-full bg-slate-900/80 px-2.5 py-1 font-mono text-xs text-sky-200">
          {value}
        </span>
      </span>
      <input
        className="range-input w-full"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
      />
      <span className="mt-1 flex justify-between text-[11px] text-slate-500">
        <span>{min}</span>
        <span>{max}</span>
      </span>
    </label>
  );
}

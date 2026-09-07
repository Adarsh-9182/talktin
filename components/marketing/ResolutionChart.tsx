/**
 * The kind of panel an agent platform shows once agents are live: how often
 * they finished the job themselves. Two prompt revisions, so the shape of the
 * chart is the argument for editing instructions rather than swapping models.
 */
const V2 = [61, 64, 63, 68, 72, 74, 79, 83, 86, 87, 88];
const V1 = [58, 59, 57, 60, 61, 60, 62, 61, 63, 62, 62];

const WIDTH = 320;
const HEIGHT = 120;

function path(series: number[]): string {
  const min = 50;
  const max = 95;
  return series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * WIDTH;
      const y = HEIGHT - ((value - min) / (max - min)) * HEIGHT;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function ResolutionChart() {
  const latest = V2.at(-1)!;

  return (
    <div className="rounded-2xl border border-line p-5">
      <p className="text-[12.5px] text-muted">Resolution rate</p>
      <p className="mt-1 text-[28px] font-semibold tracking-tight">{latest}.4%</p>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-4 w-full"
        role="img"
        aria-label={`Resolution rate rising to ${latest}.4 percent on the current instructions, against ${V1.at(-1)} percent on the previous ones`}
      >
        <path d={path(V1)} fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-300" />
        <path d={path(V2)} fill="none" stroke="currentColor" strokeWidth="2" className="text-ink" />
      </svg>

      <ul className="mt-3 flex gap-4 text-[11.5px] text-muted">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="h-[2px] w-4 bg-ink" /> v2 instructions
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="h-[2px] w-4 bg-zinc-300" /> v1
        </li>
      </ul>
    </div>
  );
}

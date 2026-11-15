import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useReactFlow, useViewport } from "@xyflow/react";
import { Check, ChevronDown } from "lucide-react";

import { boardMotion, viewportAnimation } from "@/lib/motion";

const zoomPresets = [50, 75, 100, 150, 200]; // TODO: Move to external file

type ZoomPresetMenuProps = {
  triggerClassName: string;
};

export default function ZoomPresetMenu({
  triggerClassName,
}: ZoomPresetMenuProps) {
  const { zoomTo } = useReactFlow();
  const { zoom } = useViewport();
  const zoomPercent = Math.round(zoom * 100);

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        type="button"
        aria-label={`Zoom presets, current zoom ${zoomPercent}%`}
        className={`flex h-8.5 min-w-16 items-center justify-center gap-1 px-2 text-sm tabular-nums data-[state=open]:bg-plot-accent-soft data-[state=open]:text-plot-accent-soft-foreground ${triggerClassName}`}
      >
        {zoomPercent}%
        <ChevronDown size={12} strokeWidth={1.75} aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        aria-label="Zoom presets"
        side="top"
        sideOffset={12}
        collisionPadding={8}
        className="plot-menu nopan nowheel z-10 min-w-28 rounded-xl border border-plot-border bg-plot-surface p-1.25 text-sm text-plot-text shadow"
      >
        <DropdownMenu.RadioGroup
          value={String(zoomPercent)}
          onValueChange={(value) =>
            void zoomTo(
              Number(value) / 100,
              viewportAnimation(boardMotion.zoom),
            )
          }
        >
          {zoomPresets.map((preset) => (
            <DropdownMenu.RadioItem
              key={preset}
              value={String(preset)}
              className="flex h-8.5 cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 tabular-nums outline-none data-[state=checked]:text-plot-accent-soft-foreground data-[highlighted]:bg-plot-toolbar-hover"
            >
              {preset}%
              <DropdownMenu.ItemIndicator>
                <Check size={14} strokeWidth={1.75} aria-hidden="true" />
              </DropdownMenu.ItemIndicator>
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import { LAYOUT_PRESETS } from "../initial-data";
import { LayoutPreset, HomeSection } from "../types";
import { cn } from "@/lib/utils";

interface PresetsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyPreset: (preset: LayoutPreset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  open,
  onOpenChange,
  onApplyPreset,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Homepage Layout Presets</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Quickly load pre-designed homepage arrangements tailored for campaigns and events.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-3">
            {LAYOUT_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="group relative p-4 rounded-xl border bg-card hover:border-primary transition-all duration-200 hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-foreground">{preset.name}</h4>
                    <span className="text-xs text-muted-foreground font-arabic">
                      ({preset.nameAr})
                    </span>
                    <Badge className={cn("text-[10px] font-bold border", preset.tagColor)}>
                      {preset.tag}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                  <p className="text-[11px] text-muted-foreground/80 font-arabic">
                    {preset.descriptionAr}
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="font-semibold text-primary">
                      {preset.sections.length} Sections included
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    onApplyPreset(preset);
                    onOpenChange(false);
                  }}
                  className="gap-2 text-xs font-bold shrink-0 self-end sm:self-center"
                >
                  <span>Apply Preset</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

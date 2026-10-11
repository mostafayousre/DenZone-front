"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Smartphone, Copy, Check, ExternalLink } from "lucide-react";

interface LivePreviewQRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LivePreviewQRModal: React.FC<LivePreviewQRModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [copied, setCopied] = useState(false);
  const previewUrl = "https://app.denzone.com/preview/home-draft-v24";

  const handleCopy = () => {
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-6 text-center space-y-4">
        <DialogHeader className="items-center text-center space-y-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
            <Smartphone className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold">Test Live on Mobile Device</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Scan with your iPhone or Android camera to preview this homepage layout live inside the DentZone mobile app.
          </DialogDescription>
        </DialogHeader>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl border shadow-inner inline-block mx-auto">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
              previewUrl
            )}`}
            alt="Mobile Preview QR Code"
            className="h-44 w-44 mx-auto rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground">Or share direct preview token link:</p>
          <div className="flex items-center gap-1.5">
            <Input
              readOnly
              value={previewUrl}
              className="text-xs h-8 font-mono bg-secondary/50 select-all"
            />
            <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground">
          Changes update automatically when you tap "Save Layout".
        </p>
      </DialogContent>
    </Dialog>
  );
};

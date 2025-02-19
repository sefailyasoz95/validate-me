"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CopyUrlButton({ pollId }: { pollId: string }) {
  const [copying, setCopying] = useState(false);

  const copyToClipboard = async () => {
    try {
      setCopying(true);
      const url = `${window.location.origin}/polls/${pollId}`;
      await navigator.clipboard.writeText(url);
      toast.success("Poll URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy URL");
    } finally {
      setCopying(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={copyToClipboard}
      disabled={copying}
    >
      <Copy className="h-4 w-4" />
      {copying ? "Copying..." : "Share"}
    </Button>
  );
}

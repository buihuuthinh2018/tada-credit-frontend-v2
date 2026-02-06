"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingBackButtonProps {
  bottomOffset?: number;
}

export function FloatingBackButton({ bottomOffset = 20 }: FloatingBackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed left-4 z-50 opacity-50 hover:opacity-100 transition-opacity rounded-full shadow-lg border-2 w-12 h-12 md:hidden"
      style={{ bottom: `${bottomOffset}px` }}
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-5 h-5" />
    </Button>
  );
}

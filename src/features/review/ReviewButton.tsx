"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";

type ReviewButtonProps = {
  saved: boolean;
  onClick: () => void;
};

export default function ReviewButton({
  saved,
  onClick,
}: ReviewButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-2
        rounded-xl px-3 py-2
        ring-1 transition
        text-xs md:text-sm

        ${
          saved
            ? "bg-amber-500/90 hover:bg-amber-500 ring-amber-300/30"
            : "bg-white/8 hover:bg-white/12 ring-white/10"
        }
      `}
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}

      {saved ? "Guardada para repasar" : "Repasar después"}
    </button>
  );
}
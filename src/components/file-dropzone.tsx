import { useCallback, useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDropzone({ onFile }: { onFile: (file: File) => void }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card/40 p-12 text-center transition-colors hover:border-primary/60 hover:bg-card/70",
        drag && "border-primary bg-primary/5"
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary shadow-elegant">
        <FileUp className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <p className="font-display text-base font-semibold">Drop your CSV here</p>
        <p className="text-sm text-muted-foreground">or click to browse — max 50MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}

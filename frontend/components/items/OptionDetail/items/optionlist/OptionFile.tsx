import { ChevronRight, FileTextIcon, ImageIcon } from "lucide-react";
import React from "react";

interface OptionFileProps {
  isOpenMedia: boolean;
  setIsOpenMedia: () => void;
}

const OptionFile = ({ isOpenMedia, setIsOpenMedia }: OptionFileProps) => {
  return (
    <div className="rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-accent group"
        onClick={setIsOpenMedia}
      >
        <span className="font-medium text-foreground group-hover:text-primary">
          File phương tiện & file
        </span>
        <ChevronRight
          className={`size-4 text-muted-foreground transition-all duration-300 ${
            isOpenMedia
              ? "rotate-90 text-primary"
              : "group-hover:translate-x-0.5"
          }`}
        />
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpenMedia ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 py-1 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent group/item">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
              <ImageIcon className="size-4 text-primary" />
            </div>
            <span className="text-sm text-foreground">
              File phương tiện (12)
            </span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent group/item">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
              <FileTextIcon className="size-4 text-primary" />
            </div>
            <span className="text-sm text-foreground">File (5)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionFile;

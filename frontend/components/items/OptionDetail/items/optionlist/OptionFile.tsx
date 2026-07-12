import { ChevronRight, FileTextIcon, ImageIcon } from "lucide-react";
import React from "react";

interface OptionFileProps {
  isOpenMedia: boolean;
  setIsOpenMedia: () => void;
}

const OptionFile = ({ isOpenMedia, setIsOpenMedia }: OptionFileProps) => {
  return (
    <div>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-matcha/5 dark:hover:bg-matcha/10 group"
        onClick={setIsOpenMedia}
      >
        <span className="text-sm font-medium text-foreground group-hover:text-forest dark:group-hover:text-matcha-light">
          File phương tiện & file
        </span>
        <ChevronRight
          className={`size-4 text-muted-foreground ${isOpenMedia ? "rotate-90 text-forest dark:text-matcha-light" : ""}`}
        />
      </div>

      {/* Content */}
      {isOpenMedia && (
        <div className="px-1 pb-1 space-y-0.5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-matcha/5 dark:hover:bg-matcha/10">
            <div className="p-1.5 rounded-md bg-matcha/10 dark:bg-matcha/20">
              <ImageIcon className="size-3.5 text-forest dark:text-matcha-light" />
            </div>
            <span className="text-sm text-foreground">File phương tiện (0)</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-matcha/5 dark:hover:bg-matcha/10">
            <div className="p-1.5 rounded-md bg-matcha/10 dark:bg-matcha/20">
              <FileTextIcon className="size-3.5 text-forest dark:text-matcha-light" />
            </div>
            <span className="text-sm text-foreground">File (0)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionFile;
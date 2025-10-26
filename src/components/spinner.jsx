import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const Spinner = ({ className, ...props }) => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <LoaderCircle
        role="status"
        aria-label="Loading"
        className={cn("size-16 text-primary animate-spin", className)}
        {...props}
      />
    </div>
  );
};
export default Spinner;

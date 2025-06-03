import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type InstagramAccount } from "@/types/instagram/instagramTypes";

const ACCOUNTS: { value: InstagramAccount; label: string }[] = [
  { value: "montella", label: "Montella" },
  { value: "alenka", label: "Alenka" },
  { value: "kids", label: "Kids" },
];

interface Props {
  value: InstagramAccount;
  onChange: (account: InstagramAccount) => void;
  disabled?: boolean;
}

export const InstagramAccountDropdown: React.FC<Props> = ({ value, onChange, disabled = false }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="min-w-[140px] justify-between"
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            <span>
              {ACCOUNTS.find((a) => a.value === value)?.label}
            </span>
          </span>
          <ChevronDown size={18} className="ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 w-[160px]">
        <div className="py-2">
          {ACCOUNTS.map((account) => (
            <button
              key={account.value}
              className={`w-full px-4 py-2 text-left hover:bg-violet-100 dark:hover:bg-violet-900 transition ${
                value === account.value ? "font-bold text-violet-700" : ""
              }`}
              onClick={() => {
                onChange(account.value);
                setOpen(false);
              }}
              disabled={value === account.value}
            >
              {account.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

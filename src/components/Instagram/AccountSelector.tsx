import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import { ACCOUNT_INFO } from '@/utils/instagram/constants';
import type { CuentaInstagram } from '@/types/instagram/dashboard';

interface AccountSelectorProps {
  value: CuentaInstagram;
  onChange: (cuenta: CuentaInstagram) => void;
  className?: string;
  disabled?: boolean;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  value,
  onChange,
  className = '',
  disabled = false
}) => {
  const [open, setOpen] = useState(false);

  const accounts = Object.entries(ACCOUNT_INFO) as [CuentaInstagram, typeof ACCOUNT_INFO[CuentaInstagram]][];
  const selectedAccount = ACCOUNT_INFO[value];

  return (
    <Select.Root
      value={value}
      onValueChange={(newValue) => onChange(newValue as CuentaInstagram)}
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
    >
      <Select.Trigger
        className={`
          relative flex items-center justify-between gap-2 px-4 py-2.5
          bg-white/10 hover:bg-white/15 backdrop-blur-sm 
          border border-white/20 hover:border-white/30
          rounded-lg transition-all duration-200
          text-white/80 hover:text-white text-sm font-medium
          min-w-[140px] h-10
          focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10
          ${className}
        `}
        aria-label="Seleccionar cuenta de Instagram"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg leading-none">
            {selectedAccount.emoji}
          </span>
          <span className="truncate">
            {selectedAccount.name}
          </span>
        </div>
        
        <Select.Icon asChild>
          <ChevronDown 
            className={`w-4 h-4 text-white/60 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`} 
          />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="
            relative z-50 min-w-[180px] overflow-hidden rounded-lg
            bg-[#212026] border border-white/20 shadow-2xl
            backdrop-blur-sm
          "
          position="popper"
          side="bottom"
          align="start"
          sideOffset={8}
        >
          <Select.Viewport className="p-2">
            {accounts.map(([accountKey, accountInfo]) => (
              <Select.Item
                key={accountKey}
                value={accountKey}
                className="
                  relative flex items-center gap-3 px-3 py-2.5 rounded-md
                  text-white/80 hover:text-white text-sm
                  hover:bg-white/10 focus:bg-white/10
                  cursor-pointer outline-none
                  transition-all duration-150
                  data-[highlighted]:bg-white/10
                "
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-lg leading-none">
                    {accountInfo.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {accountInfo.name}
                    </div>
                    <div className="text-xs text-white/50 truncate">
                      {accountInfo.description}
                    </div>
                  </div>
                </div>

                <Select.ItemIndicator className="flex items-center">
                  <Check className="w-4 h-4 text-[#51590E]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export default AccountSelector;
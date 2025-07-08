import React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { INSTAGRAM_ACCOUNTS } from "@/types/instagram/instagramTypes";

interface AccountSelectorProps {
  selectedAccount: string;
  onAccountChange: (account: string) => void;
  disabled?: boolean;
  className?: string;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  selectedAccount,
  onAccountChange,
  disabled = false,
  className = ""
}) => {
  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      
      <Select.Root 
        value={selectedAccount} 
        onValueChange={onAccountChange}
        disabled={disabled}
      >
        <Select.Trigger className="group flex items-center justify-between w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white/80 hover:bg-white/15 focus:bg-white/15 focus:border-[#e327c4]/50 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed">
          <Select.Value placeholder="Selecciona una cuenta" className="text-white/70" />
          <Select.Icon asChild>
            <ChevronDown className="h-4 w-4 text-white/60 group-data-[state=open]:rotate-180 transition-transform" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="overflow-hidden bg-[#212026] backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl z-50 min-w-[var(--radix-select-trigger-width)]">
            <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white/5 text-white/60 cursor-default">
              <ChevronDown className="h-3 w-3 rotate-180" />
            </Select.ScrollUpButton>
            
            <Select.Viewport className="p-2">
              <Select.Item 
                value="TODOS"
                className="relative flex items-center px-3 py-2.5 text-sm text-white/80 rounded-lg cursor-pointer hover:bg-white/10 focus:bg-white/10 outline-none data-[state=checked]:bg-[#e327c4]/20 data-[state=checked]:text-[#e327c4]"
              >
                <Select.ItemText asChild>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#B695BF] to-[#e327c4]"></div>
                    <span>Todas las cuentas</span>
                  </div>
                </Select.ItemText>
                <Select.ItemIndicator className="absolute right-2">
                  <Check className="h-3 w-3" />
                </Select.ItemIndicator>
              </Select.Item>
              
              {INSTAGRAM_ACCOUNTS.filter(account => account.isActive).map(account => (
                <Select.Item 
                  key={account.name} 
                  value={account.name}
                  className="relative flex items-center px-3 py-2.5 text-sm text-white/80 rounded-lg cursor-pointer hover:bg-white/10 focus:bg-white/10 outline-none data-[state=checked]:bg-[#e327c4]/20 data-[state=checked]:text-[#e327c4]"
                >
                  <Select.ItemText asChild>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getAccountColor(account.name)}`}></div>
                      <span>{account.displayName}</span>
                    </div>
                  </Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2">
                    <Check className="h-3 w-3" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            
            <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white/5 text-white/60 cursor-default">
              <ChevronDown className="h-3 w-3" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      
      {selectedAccount && selectedAccount !== "TODOS" && (
        <div className="px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <p className="text-xs text-white/60">
            📊 Mostrando datos de <span className="text-[#e327c4] font-medium">@{selectedAccount.toLowerCase()}</span>
          </p>
        </div>
      )}
    </div>
  );
};

const getAccountColor = (accountName: string): string => {
  switch (accountName) {
    case 'Montella':
      return 'bg-[#D94854]';
    case 'Alenka':
      return 'bg-[#e327c4]';
    case 'Kids':
      return 'bg-[#51590E]';
    default:
      return 'bg-[#B695BF]';
  }
};

export default AccountSelector;
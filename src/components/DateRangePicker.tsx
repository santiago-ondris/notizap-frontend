import { useState } from "react";

interface Props {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export const DateRangePicker: React.FC<Props> = ({ from, to, onChange }) => {
  const [fromDate, setFromDate] = useState(from);
  const [toDate, setToDate] = useState(to);

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value);
    onChange(e.target.value, toDate);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value);
    onChange(fromDate, e.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm">Desde</label>
      <input
        type="date"
        value={fromDate}
        onChange={handleFromChange}
        className="rounded border p-1 text-sm"
      />
      <label className="text-sm">Hasta</label>
      <input
        type="date"
        value={toDate}
        onChange={handleToChange}
        className="rounded border p-1 text-sm"
      />
    </div>
  );
};

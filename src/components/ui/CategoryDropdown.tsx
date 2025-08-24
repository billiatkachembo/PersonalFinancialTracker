import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const commonCategories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Healthcare',
  'Entertainment',
  'Education',
  'Travel',
  'Housing',
  'Apparel',
  'Beauty',
  'Culture',
  'Loan',
  'Other',
];

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  value,
  onChange,
  placeholder = 'Select category',
}) => {
  return (
    <Select value={value} onValueChange={onChange} aria-label="Category">
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {commonCategories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

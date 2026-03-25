import { CATEGORIES } from '@/utils/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useMemo } from 'react';

interface CategoryFilterProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  /** All categories from the catalog (includes custom). Merged with preset list. */
  catalogCategories?: string[];
}

function mergeCategoryOptions(catalogCategories?: string[]): string[] {
  const preset = [...CATEGORIES];
  if (!catalogCategories?.length) {
    return preset;
  }
  const extra = catalogCategories
    .filter((c) => c && !preset.includes(c))
    .sort((a, b) => a.localeCompare(b));
  return [...preset, ...extra];
}

const CategoryFilter = ({ selected, onChange, catalogCategories }: CategoryFilterProps) => {
  const options = useMemo(
    () => mergeCategoryOptions(catalogCategories),
    [catalogCategories]
  );

  const handleToggle = (category: string) => {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category));
    } else {
      onChange([...selected, category]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Category</h3>
      <div className="space-y-2 max-h-[min(50vh,320px)] overflow-y-auto pr-1">
        {options.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category}`}
              checked={selected.includes(category)}
              onCheckedChange={() => handleToggle(category)}
            />
            <Label
              htmlFor={`category-${category}`}
              className="text-sm font-normal cursor-pointer leading-snug"
            >
              {category}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;

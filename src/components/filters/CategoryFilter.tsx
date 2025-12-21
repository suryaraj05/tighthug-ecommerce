import { CATEGORIES } from '@/utils/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CategoryFilterProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

const CategoryFilter = ({ selected, onChange }: CategoryFilterProps) => {
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
      <div className="space-y-2">
        {CATEGORIES.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category}`}
              checked={selected.includes(category)}
              onCheckedChange={() => handleToggle(category)}
            />
            <Label
              htmlFor={`category-${category}`}
              className="text-sm font-normal cursor-pointer"
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


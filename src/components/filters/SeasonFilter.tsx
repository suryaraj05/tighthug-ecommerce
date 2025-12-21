import { SEASONS } from '@/utils/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface SeasonFilterProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

const SeasonFilter = ({ selected, onChange }: SeasonFilterProps) => {
  const handleToggle = (season: string) => {
    if (selected.includes(season)) {
      onChange(selected.filter((s) => s !== season));
    } else {
      onChange([...selected, season]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Season</h3>
      <div className="space-y-2">
        {SEASONS.map((season) => (
          <div key={season} className="flex items-center space-x-2">
            <Checkbox
              id={`season-${season}`}
              checked={selected.includes(season)}
              onCheckedChange={() => handleToggle(season)}
            />
            <Label
              htmlFor={`season-${season}`}
              className="text-sm font-normal cursor-pointer"
            >
              {season}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeasonFilter;


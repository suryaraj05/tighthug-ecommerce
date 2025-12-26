import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PriceRangeFilterProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}

const PriceRangeFilter = ({ min: initialMin, max: initialMax, onChange }: PriceRangeFilterProps) => {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  const [range, setRange] = useState([initialMin, initialMax]);

  useEffect(() => {
    setMin(initialMin);
    setMax(initialMax);
    setRange([initialMin, initialMax]);
  }, [initialMin, initialMax]);

  const handleRangeChange = (values: number[]) => {
    if (values.length === 2) {
      const newMin = Math.min(values[0], values[1]);
      const newMax = Math.max(values[0], values[1]);
      setRange([newMin, newMax]);
      setMin(newMin);
      setMax(newMax);
      // Don't call onChange immediately - let user finish dragging or use Apply button
    }
  };

  const handleMinChange = (value: string) => {
    const numValue = Math.max(initialMin, Math.min(parseInt(value) || initialMin, max));
    const newRange = [numValue, max];
    setMin(numValue);
    setRange(newRange);
    // Don't call onChange immediately - let user finish typing or use Apply button
  };

  const handleMaxChange = (value: string) => {
    const numValue = Math.max(min, Math.min(parseInt(value) || initialMax, initialMax));
    const newRange = [min, numValue];
    setMax(numValue);
    setRange(newRange);
    // Don't call onChange immediately - let user finish typing or use Apply button
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Price Range</h3>
      <div className="space-y-4">
        <div className="px-2">
          <Slider
            value={range}
            onValueChange={handleRangeChange}
            min={initialMin}
            max={initialMax}
            step={100}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price-min" className="text-xs text-muted-foreground">
              Min (₹)
            </Label>
            <Input
              id="price-min"
              type="number"
              value={min}
              onChange={(e) => handleMinChange(e.target.value)}
              min={initialMin}
              max={max}
              step={100}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="price-max" className="text-xs text-muted-foreground">
              Max (₹)
            </Label>
            <Input
              id="price-max"
              type="number"
              value={max}
              onChange={(e) => handleMaxChange(e.target.value)}
              min={min}
              max={initialMax}
              step={100}
              className="mt-1"
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Range: ₹{min.toLocaleString()} - ₹{max.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default PriceRangeFilter;


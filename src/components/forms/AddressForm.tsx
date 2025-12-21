import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateRequired, validatePhone, validateZip } from '@/utils/validators';

export interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  initialValues?: Partial<AddressFormData>;
  loading?: boolean;
  onFormChange?: (data: AddressFormData | null, isValid: boolean) => void;
}

const AddressForm = ({ onSubmit, initialValues, loading = false, onFormChange }: AddressFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<AddressFormData>({
    defaultValues: initialValues,
    mode: 'onChange', // Validate on change
  });

  // Watch all form values
  const formValues = watch();

  // Notify parent when form changes
  useEffect(() => {
    if (onFormChange) {
      const hasAllFields = 
        formValues.street?.trim() &&
        formValues.city?.trim() &&
        formValues.state?.trim() &&
        formValues.zip?.trim() &&
        formValues.phone?.trim();
      
      // Check if there are any errors
      const hasNoErrors = !errors.street && !errors.city && !errors.state && !errors.zip && !errors.phone;
      
      // Form is valid if all fields are filled and there are no errors
      const isFormValid = hasAllFields && hasNoErrors;
      
      if (isFormValid) {
        // Ensure all values are trimmed
        const cleanFormValues: AddressFormData = {
          street: formValues.street?.trim() || '',
          city: formValues.city?.trim() || '',
          state: formValues.state?.trim() || '',
          zip: formValues.zip?.trim() || '',
          phone: formValues.phone?.trim() || '',
        };
        onFormChange(cleanFormValues, true);
      } else {
        onFormChange(null, false);
      }
    }
  }, [formValues, errors, onFormChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="street">Street Address *</Label>
        <Input
          id="street"
          {...register('street', {
            required: 'Street address is required',
            validate: validateRequired,
          })}
          className={errors.street ? 'border-red-500' : ''}
          disabled={loading}
        />
        {errors.street && (
          <p className="text-sm text-red-500 mt-1">{errors.street.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            {...register('city', {
              required: 'City is required',
              validate: validateRequired,
            })}
            className={errors.city ? 'border-red-500' : ''}
            disabled={loading}
          />
          {errors.city && (
            <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            {...register('state', {
              required: 'State is required',
              validate: validateRequired,
            })}
            className={errors.state ? 'border-red-500' : ''}
            disabled={loading}
          />
          {errors.state && (
            <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zip">ZIP Code *</Label>
          <Input
            id="zip"
            type="text"
            maxLength={6}
            {...register('zip', {
              required: 'ZIP code is required',
              validate: (value) => {
                const trimmed = (value || '').trim();
                if (!trimmed) {
                  return 'ZIP code is required';
                }
                // Indian PIN code: exactly 6 digits
                if (!/^[0-9]{6}$/.test(trimmed)) {
                  return 'Please enter a valid 6-digit PIN code';
                }
                return true; // Valid
              },
            })}
            className={errors.zip ? 'border-red-500' : ''}
            disabled={loading}
          />
          {errors.zip && (
            <p className="text-sm text-red-500 mt-1">{errors.zip.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            maxLength={15}
            placeholder="10-digit mobile number"
            {...register('phone', {
              required: 'Phone number is required',
              validate: (value) => {
                const error = validatePhone(value);
                if (error) {
                  return 'Please enter a valid 10-digit Indian mobile number';
                }
                return true;
              },
            })}
            className={errors.phone ? 'border-red-500' : ''}
            disabled={loading}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Enter 10-digit mobile number (e.g., 9876543210)
          </p>
        </div>
      </div>
    </form>
  );
};

export default AddressForm;


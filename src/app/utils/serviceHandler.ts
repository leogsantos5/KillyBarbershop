import { toast } from 'react-hot-toast';
import { ServiceResponse } from '../types/other';

type ServiceFunction = () => Promise<ServiceResponse>;

export async function handleServiceCall(serviceCall: ServiceFunction, successMessage: string, 
                                        errorMessage: string, onSuccess?: () => void): Promise<boolean> {
  try {
    const result = await serviceCall();
    if (result.success) {
      toast.success(successMessage);
      if (onSuccess) {
        onSuccess();
      }
      return true;
    } else {
      toast.error(errorMessage);
      return false;
    }
  } catch {
    toast.error(errorMessage);
    return false;
  }
} 
import { toast } from 'react-hot-toast';
import { ServiceResponse } from '../types/other';

type ServiceFunction = () => Promise<ServiceResponse>;

export async function handleServiceCall(serviceCall: ServiceFunction, successMessage: string, errorMessage: string) : 
                      Promise<ServiceResponse> {
  try {
    const result = await serviceCall();
    
    if (result.success) {
      toast.success(successMessage);
    } else {
      const errorToShow = result.error instanceof Error ? result.error.message : errorMessage;
      toast.error(errorToShow);
    }
    return result;
  } catch (error) {
    const errorToShow = error instanceof Error ? error.message : errorMessage;
    toast.error(errorToShow);
    return { success: false, error: error instanceof Error ? error : new Error(errorMessage) };
  }
} 
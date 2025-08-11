import { config } from '../config/environment';

export const useDebugStatus = () => {
  return {
    isEnabled: config.DEBUG_MODE,
    isLoading: false,
    error: null
  };
};

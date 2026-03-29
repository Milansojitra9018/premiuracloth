import toast from 'react-hot-toast';

export const handleApiError = (error: any, message: string = "Something went wrong with the request") => {
  console.error(error);
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      borderRadius: '100px',
      background: '#333',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 'bold',
    },
  });
};

export const safeFetch = async <T>(promise: Promise<T>, errorMessage?: string): Promise<T | null> => {
  try {
    return await promise;
  } catch (error) {
    handleApiError(error, errorMessage);
    return null;
  }
};

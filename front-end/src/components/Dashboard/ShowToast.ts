// utils/toast.js
import { toast } from 'react-toastify';

export const showToast = (message : string, options : string) => {
    if (options === 'success')
    {
        toast.success(message);
    }
    else if (options === 'error')
    {
        toast.error(message);
    }
    else if (options === 'add')
    {
        toast.success(message, {
            style: {
              border: '1px solid #713200',
              padding: '16px',
              color: '#713200',
            },
          });
    }

  };


import { useState } from "react";

export const useCustomerOperations = () => {
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  
  return {
    isAddCustomerDialogOpen,
    setIsAddCustomerDialogOpen
  };
};


export interface CheckoutDetails {
  paymentMethod: "cash" | "bank_transfer" | "other";
  bankRefNo: string;
  collectedBy: string;
  showCheckoutForm: boolean;
  gasCharge?: number; 
  finalGasWeight?: number;
  extraPersonCharge?: number;
}

export interface UseRoomOperationsReturn {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cleanedBy: string;
  setCleanedBy: React.Dispatch<React.SetStateAction<string>>;
  isCheckoutDialogOpen: boolean;
  setIsCheckoutDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAddCustomerDialogOpen: boolean;
  setIsAddCustomerDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  checkoutDetails: CheckoutDetails;
  setCheckoutDetails: React.Dispatch<React.SetStateAction<CheckoutDetails>>;
  calculateTotalStay: () => number;
  calculateAmountDue: () => number; // Changed to be synchronous for the UI
  handleDeleteRoom: () => Promise<void>;
  handleCleaningComplete: () => Promise<void>; // No arguments expected
  handleCheckout: () => Promise<void>;
}

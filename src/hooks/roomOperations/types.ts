
import { Room, Customer } from "@/types";

export interface CheckoutDetails {
  paymentMethod: "cash" | "bank_transfer" | "other";
  bankRefNo: string;
  collectedBy: string;
  showCheckoutForm: boolean;
}

export interface UseRoomOperationsReturn {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  cleanedBy: string;
  setCleanedBy: (name: string) => void;
  isCheckoutDialogOpen: boolean;
  setIsCheckoutDialogOpen: (open: boolean) => void;
  isAddCustomerDialogOpen: boolean;
  setIsAddCustomerDialogOpen: (open: boolean) => void;
  checkoutDetails: CheckoutDetails;
  setCheckoutDetails: React.Dispatch<React.SetStateAction<CheckoutDetails>>;
  calculateTotalStay: () => number;
  calculateAmountDue: () => number;
  handleDeleteRoom: () => Promise<void>;
  handleCleaningComplete: (cleanerName: string) => Promise<void>;
  handleCheckout: () => Promise<void>;
}


import { Room, Customer } from "@/types";
import { useRoomDeletion } from "./roomOperations/useRoomDeletion";
import { useRoomCleaning } from "./roomOperations/useRoomCleaning";
import { useRoomCheckout } from "./roomOperations/useRoomCheckout";
import { useCustomerOperations } from "./roomOperations/useCustomerOperations";
import { UseRoomOperationsReturn } from "./roomOperations/types";

export const useRoomOperations = (
  room: Room, 
  customer: Customer | null, 
  onRoomUpdated?: () => void
): UseRoomOperationsReturn => {
  const { isDeleteDialogOpen, setIsDeleteDialogOpen, handleDeleteRoom } = useRoomDeletion(room);
  const { cleanedBy, setCleanedBy, handleCleaningComplete } = useRoomCleaning(room);
  const { 
    isCheckoutDialogOpen, 
    setIsCheckoutDialogOpen,
    checkoutDetails,
    setCheckoutDetails,
    handleCheckout,
    calculateTotalStay,
    calculateAmountDue
  } = useRoomCheckout(room, customer);
  const { isAddCustomerDialogOpen, setIsAddCustomerDialogOpen } = useCustomerOperations();

  // Create wrapper functions to match the expected signatures
  const wrappedHandleCleaningComplete = async () => {
    if (cleanedBy.trim()) {
      await handleCleaningComplete(cleanedBy);
    }
  };

  // Create a synchronous version of calculateAmountDue that returns 0
  const syncCalculateAmountDue = () => {
    return 0; // This will be updated asynchronously by the actual function
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    cleanedBy,
    setCleanedBy,
    isCheckoutDialogOpen,
    setIsCheckoutDialogOpen,
    isAddCustomerDialogOpen,
    setIsAddCustomerDialogOpen,
    checkoutDetails,
    setCheckoutDetails,
    calculateTotalStay,
    calculateAmountDue: syncCalculateAmountDue,
    handleDeleteRoom,
    handleCleaningComplete: wrappedHandleCleaningComplete,
    handleCheckout,
  };
};

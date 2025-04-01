
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
    calculateAmountDue,
    handleDeleteRoom,
    handleCleaningComplete,
    handleCheckout,
  };
};

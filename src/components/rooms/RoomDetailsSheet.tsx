
import React, { useState, useEffect } from "react";
import { Room, Customer } from "@/types";
import RoomDetailsDialog from "@/components/RoomDetailsDialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { calculateDays } from "@/utils/date-utils";
import { processCheckout, addPayment, processEarlyCheckout } from "@/services/dataService";
import { updateRoom } from "@/services/rooms";
import { useToast } from "@/hooks/use-toast";

interface RoomDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRoom: Room | null;
  roomCustomers: {[key: string]: Customer | null};
  onRoomUpdated: () => void;
}

const RoomDetailsSheet = ({ 
  isOpen, 
  onOpenChange, 
  selectedRoom, 
  roomCustomers,
  onRoomUpdated
}: RoomDetailsSheetProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    amount: 0,
    method: "cash",
    bankRefNo: "",
    collectedBy: "",
    paymentType: "checkout"
  });

  const handleCheckout = () => {
    if (!selectedRoom) return;

    const customer = selectedRoom ? roomCustomers[selectedRoom.id] : null;
    if (customer) {
      const checkInDate = new Date(customer.checkInDate);
      const today = new Date();
      const daysStayed = Math.max(1, Math.ceil((today.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)));
      const totalAmount = selectedRoom.rate * daysStayed;
      const depositAmount = customer.depositAmount || 0;
      const amountDue = Math.max(0, totalAmount - depositAmount);
      
      setPaymentInfo({
        amount: amountDue,
        method: "cash",
        bankRefNo: "",
        collectedBy: "",
        paymentType: "checkout"
      });
      
      onOpenChange(false);
      navigate(`/rooms?roomId=${selectedRoom.id}&action=checkout`);
    } else {
      toast({
        title: "Error",
        description: "Could not find customer information for this room.",
        variant: "destructive",
      });
    }
  };

  const handleEarlyCheckout = async (
    actualCheckoutDate: string, 
    refundAmount: number, 
    refundDetails: {
      method: 'cash' | 'bank_transfer' | 'other',
      collectedBy: string,
      notes?: string
    }
  ) => {
    if (!selectedRoom || !roomCustomers[selectedRoom.id]) return;
    
    const customer = roomCustomers[selectedRoom.id];
    if (!customer) return;
    
    try {
      console.log(`Processing early checkout for room: ${selectedRoom.id}, customer: ${customer.id}`);
      console.log(`Actual checkout date: ${actualCheckoutDate}, refund amount: ${refundAmount}`);
      
      const success = await processEarlyCheckout(
        selectedRoom.id, 
        customer.id, 
        actualCheckoutDate, 
        refundAmount, 
        refundDetails
      );
      
      if (success) {
        // No need to update room status here as processEarlyCheckout already does it
        
        toast({
          title: "Checkout Complete",
          description: `Room ${selectedRoom.roomNumber} has been checked out early and refund processed`,
        });
        
        onOpenChange(false);
        
        // Give time for the database to update before refreshing data
        setTimeout(() => {
          onRoomUpdated();
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: "Failed to process early checkout",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during early checkout:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during checkout",
        variant: "destructive",
      });
    }
  };

  const handleEditRoom = async (updatedRoom: Partial<Room>) => {
    if (!selectedRoom) return;
    
    try {
      const updated = await updateRoom(selectedRoom.id, updatedRoom);
      if (updated) {
        toast({
          title: "Room Updated",
          description: `Room ${updated.roomNumber} has been updated successfully`,
        });
        onRoomUpdated();
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to update room",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the room",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto" side="right">
        <RoomDetailsDialog
          room={selectedRoom}
          customer={selectedRoom ? roomCustomers[selectedRoom.id] : null}
          isOpen={isOpen}
          onClose={() => onOpenChange(false)}
          onCheckout={handleCheckout}
          onEarlyCheckout={handleEarlyCheckout}
          onEdit={handleEditRoom}
        />
      </SheetContent>
    </Sheet>
  );
};

export default RoomDetailsSheet;

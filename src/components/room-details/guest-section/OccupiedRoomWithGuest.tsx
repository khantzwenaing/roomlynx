import React from "react";
import { Room, Customer } from "@/types";
import { User } from "lucide-react";
import GuestInfoSection from "@/components/room-details/GuestInfoSection";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface OccupiedRoomWithGuestProps {
  room: Room;
  customer: Customer;
}

const OccupiedRoomWithGuest = ({
  room,
  customer,
}: OccupiedRoomWithGuestProps) => {
  const navigate = useNavigate();

  const handleViewPayments = () => {
    navigate(`/payments?customerId=${customer.id}&roomId=${room.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <GuestInfoSection customer={customer} room={room} />

        {/* Payment details and actions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-2">Payment Information</h3>
          <div className="flex gap-4 flex-wrap mb-4">
            <div className="bg-blue-50 p-2 rounded border border-blue-100">
              <div className="text-sm text-gray-500">Deposit</div>
              <div className="font-medium">₹{customer.depositAmount || 0}</div>
            </div>

            <div className="bg-blue-50 p-2 rounded border border-blue-100">
              <div className="text-sm text-gray-500">Method</div>
              <div className="font-medium">
                {customer.depositPaymentMethod || "N/A"}
              </div>
            </div>

            <div className="bg-blue-50 p-2 rounded border border-blue-100">
              <div className="text-sm text-gray-500">Collected By</div>
              <div className="font-medium">
                {customer.depositCollectedBy || "N/A"}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleViewPayments}
            className="text-blue-600 border-blue-600"
          >
            View All Payments
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OccupiedRoomWithGuest;

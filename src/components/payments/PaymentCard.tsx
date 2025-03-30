
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, CreditCard, LogIn, LogOut, WalletCards } from "lucide-react";
import { Payment } from "@/types";

interface PaymentCardProps {
  payment: Payment;
  getCustomerName: (customerId: string) => string;
  getRoomNumber: (roomId: string) => string;
}

const PaymentCard = ({ payment, getCustomerName, getRoomNumber }: PaymentCardProps) => {
  const getPaymentStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return "bg-hotel-success";
      case "pending":
        return "bg-hotel-warning";
      case "partial":
        return "bg-hotel-primary";
      default:
        return "bg-gray-500";
    }
  };

  const getPaymentTypeBadge = (paymentType?: string) => {
    switch (paymentType) {
      case "deposit":
        return <Badge className="bg-blue-500">Check-in Deposit</Badge>;
      case "checkout":
        return <Badge className="bg-red-500">Checkout Payment</Badge>;
      default:
        return <Badge className="bg-gray-500">Other Payment</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">${payment.amount}</CardTitle>
          <Badge className={getPaymentStatusColor(payment.status)}>
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </Badge>
        </div>
        <div className="mt-2">
          {getPaymentTypeBadge(payment.paymentType)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm font-medium">
            {getCustomerName(payment.customerId)}
          </div>
          <div className="text-sm text-gray-500">
            Room {getRoomNumber(payment.roomId)}
          </div>
          <div className="text-sm text-gray-500">
            Date: {new Date(payment.date).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            {payment.method === "cash" && <Banknote className="h-4 w-4 mr-1" />}
            {(payment.method === "card" || payment.method === "bank_transfer") && <CreditCard className="h-4 w-4 mr-1" />}
            Method: {payment.method.replace('_', ' ').charAt(0).toUpperCase() + payment.method.replace('_', ' ').slice(1)}
          </div>
          <div className="text-sm text-gray-500">
            Collected by: {payment.collectedBy}
          </div>
          {payment.notes && (
            <div className="text-sm text-gray-500">
              Notes: {payment.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentCard;

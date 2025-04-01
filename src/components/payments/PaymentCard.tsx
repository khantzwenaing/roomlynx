
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, CreditCard } from "lucide-react";
import { Payment } from "@/types";

interface PaymentCardProps {
  payment: Payment;
  getCustomerName: (customerId: string) => string;
  getRoomNumber: (roomId: string) => string;
}

const PaymentCard = ({ payment, getCustomerName, getRoomNumber }: PaymentCardProps) => {
  // Helper function to get text color based on payment status
  const getPaymentStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return "text-green-600 font-semibold";
      case "pending":
        return "text-yellow-600 font-semibold";
      case "partial":
        return "text-blue-600 font-semibold";
      default:
        return "text-gray-500";
    }
  };

  // Helper function to determine payment type and return appropriate styling
  const getPaymentTypeStyle = (payment: Payment) => {
    if (payment.isRefund) {
      return "bg-red-50 border-red-200"; // Red for refunds
    } else if (payment.paymentType === 'deposit' || (payment.notes && payment.notes.toLowerCase().includes('deposit'))) {
      return "bg-green-50 border-green-200"; // Soft green for deposits
    } else if (payment.notes && payment.notes.toLowerCase().includes('early checkout')) {
      return "bg-orange-50 border-orange-200"; // Orange for early checkout
    } else {
      return ""; // Default styling for normal checkout
    }
  };

  // Function to get payment type label
  const getPaymentTypeLabel = (payment: Payment) => {
    if (payment.isRefund) {
      return "Refund";
    } else if (payment.paymentType === 'deposit' || (payment.notes && payment.notes.toLowerCase().includes('deposit'))) {
      return "Deposit";
    } else if (payment.notes && payment.notes.toLowerCase().includes('early checkout')) {
      return "Early Checkout";
    } else {
      return "Checkout";
    }
  };

  // Function to render notes with "Deposit" in bold
  const renderNotes = (notes: string) => {
    if (!notes) return null;
    
    if (notes.includes('Deposit')) {
      const parts = notes.split(/(Deposit)/g);
      return (
        <>
          {parts.map((part, i) => 
            part === 'Deposit' ? <strong key={i}>{part}</strong> : part
          )}
        </>
      );
    }
    
    return notes;
  };

  return (
    <Card className={`border ${getPaymentTypeStyle(payment)}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <CardTitle className="text-lg">${payment.amount}</CardTitle>
            <div className="text-xs mt-1 font-medium">
              {payment.isRefund ? (
                <span className="text-red-600">{getPaymentTypeLabel(payment)}</span>
              ) : payment.paymentType === 'deposit' || (payment.notes && payment.notes.toLowerCase().includes('deposit')) ? (
                <span className="text-green-600">{getPaymentTypeLabel(payment)}</span>
              ) : payment.notes && payment.notes.toLowerCase().includes('early checkout') ? (
                <span className="text-orange-600">{getPaymentTypeLabel(payment)}</span>
              ) : (
                <span className="text-gray-500">{getPaymentTypeLabel(payment)}</span>
              )}
            </div>
          </div>
          <span className={getPaymentStatusColor(payment.status)}>
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </span>
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
              Notes: {renderNotes(payment.notes)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentCard;

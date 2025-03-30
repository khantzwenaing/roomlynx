
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PaymentForm, { PaymentFormValues } from "./PaymentForm";
import { Customer, Room } from "@/types";

interface PaymentDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (data: PaymentFormValues) => Promise<void>;
  customers: Customer[];
  rooms: Room[];
}

const PaymentDialog = ({ isOpen, setIsOpen, onSubmit, customers, rooms }: PaymentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add New Payment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Payment</DialogTitle>
        </DialogHeader>
        <PaymentForm onSubmit={onSubmit} customers={customers} rooms={rooms} />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;

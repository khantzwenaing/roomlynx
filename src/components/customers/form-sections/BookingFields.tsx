
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Control } from "react-hook-form";
import { Room } from "@/types";
import { CustomerFormValues } from "../AddCustomerForm";

interface BookingFieldsProps {
  control: Control<CustomerFormValues>;
  availableRooms: Room[];
  preselectedRoomId?: string;
  handleCheckInDateChange: (date: Date) => void;
}

const BookingFields = ({ control, availableRooms, preselectedRoomId, handleCheckInDateChange }: BookingFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="roomId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Room</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              disabled={!!preselectedRoomId}
            >
              <FormControl>
                <SelectTrigger className="text-base h-10">
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="text-base bg-white z-50">
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id} className="text-base py-2">
                    Room {room.roomNumber} ({room.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="checkInDate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker 
                  date={field.value} 
                  onDateChange={handleCheckInDateChange}
                  label="Check-in Date"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="checkOutDate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker 
                  date={field.value} 
                  onDateChange={field.onChange} 
                  label="Check-out Date"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default BookingFields;

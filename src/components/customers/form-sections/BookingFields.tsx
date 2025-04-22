
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Control } from "react-hook-form";
import { Room } from "@/types";
import { CustomerFormValues } from "../schema";
import { getCurrentISTDate } from "@/utils/date-utils";

interface BookingFieldsProps {
  control: Control<CustomerFormValues>;
  availableRooms: Room[];
  preselectedRoomId?: string;
}

const BookingFields = ({ control, availableRooms, preselectedRoomId }: BookingFieldsProps) => {
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
      
      <FormField
        control={control}
        name="checkInDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Check-in Date (Today)</FormLabel>
            <FormControl>
              <div className="p-2 border rounded-md bg-gray-50 text-gray-700">
                {getCurrentISTDate().toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </>
  );
};

export default BookingFields;

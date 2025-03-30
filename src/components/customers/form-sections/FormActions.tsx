
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  onClose: () => void;
}

const FormActions = ({ isSubmitting, onClose }: FormActionsProps) => {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Customer"}
      </Button>
      <Button variant="outline" onClick={onClose} className="w-full" disabled={isSubmitting}>
        Cancel
      </Button>
    </div>
  );
};

export default FormActions;

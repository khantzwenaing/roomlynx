
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface TodoHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const TodoHeader = ({ onRefresh, isRefreshing }: TodoHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-gray-800">Todo List</h1>
      <Button 
        onClick={onRefresh} 
        variant="outline" 
        size="sm"
        disabled={isRefreshing}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
};

export default TodoHeader;

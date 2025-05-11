
import React, { useEffect } from "react";
import TodosContainer from "@/components/todos/TodosContainer";

const Todos = () => {
  useEffect(() => {
    console.log("Todos page rendered");
  }, []);

  return <TodosContainer />;
};

export default Todos;


export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | null => {
  const allCustomers = loadFromLocalStorage("hotel_customers", customers);
  const index = allCustomers.findIndex(customer => customer.id === id);
  
  if (index === -1) return null;
  
  const updatedCustomer = { ...allCustomers[index], ...updates };
  allCustomers[index] = updatedCustomer;
  saveToLocalStorage("hotel_customers", allCustomers);
  return updatedCustomer;
};

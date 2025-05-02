# RoomLynx - Hotel Management System

RoomLynx is a comprehensive hotel management system designed to streamline room operations, guest management, and billing processes.

## Features

### Room Management

- Room status tracking (Occupied/Vacant)
- Room rate management
- Room type categorization
- Real-time availability updates

### Guest Management

- Guest check-in/check-out
- Guest information storage
- Contact details management
- Stay duration tracking

### Billing System

- Automated charge calculations
- Multiple payment methods
- Deposit management
- Refund processing

### Calculations

1. Room Charges

   - Base room rate × stay duration
   - Minimum 0.5 day stay
   - Daily rate calculations

2. Extra Person Charges

   - Per extra person beyond single occupancy
   - Applied to daily rate
   - Prorated for early checkouts

3. Gas Usage Charges

   - Initial and final gas weight tracking
   - Price per kg calculation
   - Optional service

4. Deposit Handling
   - Deposit deduction from total
   - Refund calculations
   - Minimum amount due tracking

### Checkout System

1. Regular Checkout

   - Automatic checkout date
   - Multiple payment methods
   - Bank transfer support
   - Gas usage calculation

2. Early Checkout
   - Custom checkout date
   - Prorated refunds
   - Refund details tracking
   - Charge adjustments

## Technology Stack

- Frontend: React with TypeScript
- UI Components: Custom components with modern design
- State Management: React Hooks
- Date Handling: date-fns
- Form Management: React Hook Form with Zod validation

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details

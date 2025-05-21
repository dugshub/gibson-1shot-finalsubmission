# SplitReceipt: Frontend Design Specification

## 1. Design Philosophy

- **Desktop-Optimized Approach**: Design for optimal experience on larger screens with effective use of screen real estate
- **Responsive Adaptation**: Ensure UI is still functional on smaller screens when needed
- **User-Centric Information**: Emphasize the current user's financial stake throughout the interface
- **Visual Clarity**: Use clear visual indicators for status, balances, and actions
- **Consistent Navigation**: Provide intuitive paths between related content
- **Action-Oriented**: Make primary actions clearly visible and guide user attention with visual hierarchy
- **Clean and Minimal**: Focus on content and functionality, avoiding clutter and using whitespace strategically

## 2. Frontend Structure

### Page Layout

1. **Authentication Flow**
   - Login/Register Page with email/password authentication
   - Clean, branded login form with validation
   - Redirect to Dashboard after successful authentication

2. **Dashboard**
   - Two main sections: "Active Trips" and "Settled Trips"
   - Trip cards showing essential info:
     - Trip name and dates
     - Total trip amount and **amount you paid**
     - **Your remaining balance** (positive or negative)
     - Members (avatars with count indicator)
     - **Receipt count** badge
     - Clear visual status indicator (settled/unsettled)
   - Grid layout with 2-3 columns on desktop for efficient space usage
   - "Create Trip" button prominently positioned
   - Welcome message with user's name for personalization

3. **Trip Details Page (with tabs)**
   - **Overview Tab**
     - Trip summary (name, dates, members)
     - **Your contribution** vs total trip cost
     - Balance summary showing who owes whom with **user-centric phrasing** ("You owe $X to Person Y")
     - Settlement status with visual indicator
     - **Record Settlement button** when balances exist
     - **Settlement history** section showing past payments
   
   - **Receipts Tab**
     - List of all receipts with detailed cards
     - Add receipt button
     - Receipt cards showing:
       - Date, merchant, total amount
       - **Your share** of the receipt
       - Payer name with avatar
       - **Split method indicator** (full/line-item)
       - Receipt creation date
   
   - **Members Tab**
     - List members with their total paid/owed
     - **Individual balances** between each member
     - Add/remove member functionality
     - Member permission management (owner/member)

4. **Receipt Details Page**
   - Complete receipt information (date, merchant, total, payer)
   - **Prominent toggle** between "Full Split" and "Line Item Split"
   - For Full Split:
     - Member selection with avatars
     - Split percentage/amount inputs
     - **"Split Evenly" button** for quick assignment
     - Visual indicator showing split completion (must total 100%)
   
   - For Line Item Split:
     - Table/list of all line items
     - **Modal interface** for splitting individual items
     - Line item totals and assignment status
   
   - Save/cancel actions with confirmation

5. **Add/Edit Pages**
   - Add/Edit Trip form with validation
   - Add/Edit Receipt form with dynamic line item fields
     - Add line item button
     - Line item subtotals with running receipt total
     - Merchant autocomplete based on previous entries
   
6. **Settlement Page**
   - User-friendly interface for recording payments
   - Payer and receiver selection with avatars
   - Amount input with suggested balance amount
   - Date picker with default to current date
   - Optional note field
   - Confirmation and success feedback
   - **View to show how this settlement affects overall balances**

### User Flow

1. User logs in and sees dashboard with trip cards
2. User selects existing trip or creates new one
3. Within a trip, user navigates through tabs:
   - Overview: See balances and settlement status
   - Receipts: Add/view receipts and their details
   - Members: Manage trip participants
4. When adding receipts, user enters basic info then either:
   - Splits the entire receipt among selected members
   - Adds line items and assigns them to specific members
5. System automatically calculates updated balances
6. Users record settlements when ready to resolve balances
7. Trip is marked as settled when all balances are zero

## 3. UI Components

### Essential Components

1. **Authentication Components**
   - Form with real-time validation
   - Input fields with clear error states
   - Sign in/up buttons with loading states
   - "Forgot password" functionality
   - Password strength indicator for registration

2. **Trip Card Component**
   - Card container with hover effects and clear borders
   - Header with trip name and dates
   - Large, readable amount display with user-specific amounts
   - Avatar group for members with overflow indicator
   - Badge for receipt count
   - Colored status indicator (settled/unsettled)
   - Balance indicator with color coding (red for negative, green for positive)

3. **Navigation Components**
   - Horizontal navbar with user dropdown on desktop
   - Clearly highlighted active tab/section
   - Breadcrumb navigation for deeper pages
   - Back buttons for multi-step processes
   - User profile/avatar with dropdown menu

4. **Receipt Components**
   - Receipt card with expandable/collapsible details
   - Receipt form with dynamic line item fields
   - Split type toggle with clear visual difference
   - Receipt split interface with:
     - Member selection checkboxes with avatars
     - Split percentage inputs that validate total = 100%
     - Split amount inputs that validate total = receipt total
     - "Split evenly" button that calculates equal distributions

5. **Balance Display Components**
   - Summary cards showing total balances
   - User balance list with positive/negative styling
   - Settlement action buttons with clear calls to action
   - Balance visualization (optional: small charts/graphs)
   - Color coding for owing (red) vs. owed (green)

6. **Forms & Inputs**
   - Date picker with presets for common dates
   - Number inputs with currency formatting and validation
   - Multi-select for member assignment with avatars
   - Clear toggle switches for binary options
   - Autocomplete inputs for frequently used values
   - Logical grouping of related fields
   - Inline validation feedback
   - Multi-step forms for complex inputs when necessary

7. **Modals & Dialogs**
   - Confirmation dialogs for important actions
   - Split assignment modal with clear member selection
   - Add member modal with permission options
   - Error dialogs with helpful resolution suggestions

8. **Feedback Components**
   - Toast notifications for successful actions
   - Loading states (spinners or skeletons)
   - Empty states with helpful illustrations and calls-to-action
   - Success animations for completed processes

### State Management Patterns

1. **Loading States**
   - Use minimal, centered spinners for page loading
   - Consider skeleton loaders for content areas
   - Display loading indicators only after a short delay (300-500ms)
   - Keep branding consistent in loading states

2. **Empty States**
   - Provide friendly, encouraging messages
   - Include clear call-to-action
   - Use illustrations or icons where appropriate
   - Maintain consistent page structure

3. **Error States**
   - Display clear error messages
   - Provide actionable resolution steps
   - Use appropriate color coding (red for errors)
   - Consider retry mechanisms where applicable

### Implementation Priority

1. Focus first on authentication, navigation, and trip listing
2. Next implement trip details and receipt listing
3. Then add receipt creation and basic splitting
4. Finally implement balance calculation and settlements

## 4. Technical Implementation

### Color Scheme

```
Primary: #2563eb (blue-600)
Secondary: #10b981 (emerald-500)
Background: #f8fafc (slate-50)
Card Background: #ffffff (white)
Text: #1e293b (slate-800)
Muted Text: #64748b (slate-500)
Border: #e2e8f0 (slate-200)
Error: #ef4444 (red-500)
```

### Typography

```
Heading 1: 2.25rem (text-4xl), font-bold, tracking-tight
Heading 2: 1.875rem (text-3xl), font-bold
Heading 3: 1.5rem (text-2xl), font-semibold
Body: 1rem (text-base), font-normal
Small: 0.875rem (text-sm), font-normal
```

### GibsonAI Backend Setup

1. Create a new GibsonAI project
2. Submit the refined data modeling request 
3. Deploy the project
4. Get API key and OpenAPI spec URL

### Frontend Setup with GibsonAI Starter App

#### Starter App Approach

The GibsonAI starter app provides a solid foundation for building your application. Here's how to effectively use it:

1. **Setup Process**:
   - Run the GibsonAI setup script: `bash <(curl -s https://raw.githubusercontent.com/GibsonAI/next-app/main/setup.sh)`
   - Provide your project name, API key, and OpenAPI spec URL when prompted
   - The script generates a complete Next.js application with GibsonAI integration

2. **What to Keep from the Starter App**:
   - Core API client integration in `/gibson/index.ts`
   - Authentication framework and token management
   - Environment configuration (`.env.local` with API keys)
   - TypeScript type definitions for the API schema
   - Response parsing and error handling utilities
   - Base page layouts and document structure

3. **What to Modify or Replace**:
   - Navigation components (replace with app-specific navigation)
   - Example pages (remove `/getting-started` and related components)
   - Default styling to match app design guidelines
   - Base layout to incorporate app branding

4. **What to Add**:
   - ShadCN UI components for unified design
   - App-specific pages and routes
   - Custom React hooks for state management
   - Client-side API wrapper functions
   - Toast notifications for user feedback
   - Enhanced form handling with validation

#### Implementation Steps

1. Initial assessment after setup script completes:
   - Review generated files structure
   - Identify and document types and utility functions
   - Test API connectivity with a simple API call

2. Cleanup phase:
   - Remove example pages but document their patterns first
   - Create placeholder pages for core app routes
   - Update base layout while maintaining API integration

3. Components integration:
   - Install ShadCN UI and required dependencies
   - Configure theme with app color scheme
   - Build core components in isolation
   - Connect components to API functions

4. Styling customization:
   - Update Tailwind configuration for app-specific tokens
   - Create consistent component styles with variants
   - Implement responsive layouts with desktop-first approach

5. Connect API endpoints through the generated client
   - Create wrapper functions for cleaner API access
   - Implement error handling and loading states
   - Build authentication flow

#### Potential Issues and Solutions

1. **API Type Definitions**:
   - Issue: Generated types may not perfectly match required frontend structure
   - Solution: Create adapter functions that transform API responses to frontend-friendly formats

2. **Authentication Flow**:
   - Issue: Default flow may not include all required features
   - Solution: Extend authentication context with additional state and functions

3. **Example Code Removal**:
   - Issue: Removing examples may break dependencies
   - Solution: Document dependencies before removal and replace gradually

4. **API Integration Points**:
   - Issue: Understanding where API calls should occur (client vs server)
   - Solution: Create clear patterns for client-side vs server-side API usage

### Key Technical Considerations

- Ensure proper token management for authentication
- Implement client-side validation for forms
- Create helper functions for balance calculations
- Use ShadCN UI components consistently
- Design layouts to take advantage of desktop screen space first
- Implement responsive fallbacks for smaller screens
- Create reusable components for receipts, balances, and settlements
- Use efficient state management for form handling and user interactions
- Use subtle transitions for state changes (under 300ms for UI elements)
- Consider reduced motion preferences for accessibility
- Use consistent easing functions for animations

### Desktop Layout Optimizations

- Use multi-column layouts for lists and grids
- Show more information on cards without requiring expansion
- Display related information side-by-side rather than stacked
- Use horizontal navigation and tabs effectively
- Keep important actions visible without scrolling
- Utilize modals for focused tasks while maintaining context
- Consider split-pane views for related data (e.g., trips and their receipts)

### Responsive Considerations

- Ensure all interfaces are functional on smaller screens
- Touch targets should be at least 44px height/width
- Stack elements vertically on smaller screens
- Use single columns for lists on small screens
- Test interfaces with both touch and mouse inputs
- Consider collapsible navigation for mobile views
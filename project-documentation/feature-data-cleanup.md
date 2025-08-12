---
title: Data Cleanup Feature Plan
description: Implementation plan for customer and recording deletion with complete data cleanup
feature: Data Cleanup
last-updated: 2024-12-19
version: 1.0
related-files: 
  - SYSTEM_DESIGN_SPECIFICATION.md
  - product-backlog.md
dependencies: None
status: planning
---

# Data Cleanup Feature Plan

## Executive Summary

This document outlines the implementation plan for adding delete and edit functionality to the Hebrew Sales Call Analysis System. **User research has been completed and confirmed the critical need for data cleanup functionality.** The features will allow users to:

1. **Delete individual recordings** (sales calls) from the dashboard with complete data cleanup
2. **Delete customers** with all their associated recordings and complete data removal
3. **Edit customer information** (name, phone, email) directly from the UI
4. **Comprehensive testing** for both backend and frontend functionality

**Key Requirement**: Audio file data must be completely removed from the database, not just the table records. This includes file system cleanup and database record deletion to prevent data bloat and ensure proper cleanup.

## Current System Analysis

### Backend Status
- ✅ Customer DELETE endpoint exists (`DELETE /api/customers/:id`)
- ✅ Customer PUT endpoint exists (`PUT /api/customers/:id`)
- ❌ Sales call DELETE endpoint missing
- ✅ Database schema supports cascade deletion
- ✅ File system cleanup for audio files

### Frontend Status
- ❌ No edit/delete UI components
- ❌ No API service methods for delete operations
- ❌ No confirmation modals for destructive actions
- ✅ Basic customer display components exist

## Backend Implementation Plan

### 1. Sales Call Delete Endpoint

**File**: `src/routes/analysis.js`

**New Endpoint**: `DELETE /api/analyze/:id`

**Implementation Details**:
```javascript
/**
 * DELETE /api/analyze/:id
 * Delete a sales call (recording) and its associated audio file
 * CRITICAL: Must completely remove audio file data from database and file system
 */
router.delete('/:id', async (req, res, next) => {
  // 1. Validate sales call exists and get audio file path
  // 2. Delete audio file from file system storage
  // 3. Delete database record (cascade handled by Prisma)
  // 4. Clean up any associated analysis data
  // 5. Return success response with deletion details
});
```

**Key Features**:
- **Complete file system cleanup** for audio files (physical file deletion)
- **Complete database record deletion** (not just marking as deleted)
- **Analysis data cleanup** (remove all associated analysis records)
- Error handling for missing files
- Comprehensive logging for audit trail
- **Data integrity verification** after deletion

### 2. Enhanced Customer Delete Endpoint

**File**: `src/routes/customers.js`

**Enhancement**: Improve existing `DELETE /api/customers/:id` endpoint

**Improvements**:
- **Complete audio file cleanup** for all customer recordings (physical file deletion)
- **Complete database cleanup** (remove all customer data, not just mark as deleted)
- **Analysis data cleanup** (remove all analysis records for customer recordings)
- Enhanced logging and audit trail
- Better error handling for file system operations
- **Data integrity verification** after bulk deletion

### 3. Customer Update Endpoint

**File**: `src/routes/customers.js`

**Status**: ✅ Already implemented

**Enhancement**: Add validation for phone number uniqueness

## Frontend Implementation Plan

### 1. API Service Methods

**File**: `frontend/src/services/api.ts`

**New Methods**:
```typescript
// Customer management
createCustomer(customerData): Promise<Customer>
updateCustomer(id, customerData): Promise<Customer>
deleteCustomer(id): Promise<DeletionResponse>

// Sales call management
deleteSalesCall(id): Promise<DeletionResponse>
```

### 2. Enhanced Customer Card Component

**File**: `frontend/src/components/customers/CustomerCard.tsx`

**New Features**:
- Edit mode toggle
- Inline form editing
- Delete confirmation modal
- Loading states for mutations
- Error handling and user feedback

**UI Components**:
- Edit button (pencil icon)
- Delete button (trash icon)
- Save/Cancel buttons for edit mode
- Confirmation modal for delete
- Form validation

### 3. Analysis List Component Enhancement

**File**: `frontend/src/components/analysis/AnalysisList.tsx`

**New Features**:
- Delete button for each recording
- Confirmation modal for recording deletion
- Loading states and error handling

### 4. Confirmation Modal Component

**File**: `frontend/src/components/common/ConfirmationModal.tsx`

**Purpose**: Reusable confirmation dialog for destructive actions

**Features**:
- Customizable title and message
- Confirm/Cancel buttons
- Loading states
- Accessibility support

## Database Considerations

### Current Schema Analysis
```sql
-- Customer deletion cascades to:
-- 1. sales_calls (onDelete: Cascade)
-- 2. customer_priorities (onDelete: Cascade)

-- Sales call deletion:
-- 1. Removes single sales call record
-- 2. Updates customer priority calculations
-- 3. MUST also clean up analysis data and file references
```

### Critical Data Cleanup Requirements
- **Complete record deletion** (not soft deletes)
- **File system cleanup** for all audio files
- **Analysis data cleanup** (remove all analysis records)
- **Reference cleanup** (remove all database references to deleted files)
- **Integrity verification** after deletion operations

### No Migration Required
- Current schema supports all required operations
- Cascade deletion properly configured
- Foreign key constraints ensure data integrity
- **Additional cleanup logic needed** for complete data removal

## Testing Strategy

### Backend Testing

#### 1. Unit Tests

**File**: `tests/customers.test.js`

**Test Cases**:
```javascript
describe('Customer Management', () => {
  describe('DELETE /api/customers/:id', () => {
    test('should delete customer and all associated data')
    test('should delete audio files from storage')
    test('should return 404 for non-existent customer')
    test('should handle file system errors gracefully')
    test('should update customer priorities after deletion')
  });

  describe('PUT /api/customers/:id', () => {
    test('should update customer information')
    test('should validate phone number uniqueness')
    test('should return 404 for non-existent customer')
    test('should handle validation errors')
  });
});
```

**File**: `tests/analysis.test.js`

**Test Cases**:
```javascript
describe('Sales Call Management', () => {
  describe('DELETE /api/analyze/:id', () => {
    test('should delete sales call and audio file completely')
    test('should remove all analysis data from database')
    test('should delete physical audio file from file system')
    test('should return 404 for non-existent sales call')
    test('should handle missing audio files gracefully')
    test('should update customer statistics after deletion')
    test('should verify no orphaned data remains')
    test('should verify file system cleanup was successful')
  });
});
```

#### 2. Integration Tests

**File**: `tests/integration.test.js`

**Test Cases**:
```javascript
describe('Customer and Recording Integration', () => {
  test('should delete customer and all recordings')
  test('should update dashboard stats after deletions')
  test('should maintain data consistency across operations')
});
```

### Frontend Testing

#### 1. Component Tests

**File**: `frontend/src/components/customers/__tests__/CustomerCard.test.tsx`

**Test Cases**:
```typescript
describe('CustomerCard', () => {
  test('should display customer information')
  test('should enter edit mode when edit button clicked')
  test('should save changes when save button clicked')
  test('should cancel changes when cancel button clicked')
  test('should show delete confirmation modal')
  test('should delete customer when confirmed')
  test('should handle API errors gracefully')
  test('should show loading states during operations')
});
```

**File**: `frontend/src/components/analysis/__tests__/AnalysisList.test.tsx`

**Test Cases**:
```typescript
describe('AnalysisList', () => {
  test('should display analysis items')
  test('should show delete button for each recording')
  test('should confirm before deleting recording')
  test('should handle deletion errors')
});
```

#### 2. API Service Tests

**File**: `frontend/src/services/__tests__/api.test.ts`

**Test Cases**:
```typescript
describe('API Service', () => {
  test('should update customer successfully')
  test('should delete customer successfully')
  test('should delete sales call successfully')
  test('should handle API errors')
});
```

### 3. End-to-End Testing

**File**: `tests/e2e/customer-management.test.js`

**Test Cases**:
```javascript
describe('Customer Management E2E', () => {
  test('should edit customer information')
  test('should delete customer with all recordings')
  test('should delete individual recording')
  test('should handle concurrent operations')
});
```

## Validation Strategy

### 1. Manual Testing Checklist

#### Backend Validation
- [ ] Customer deletion removes all associated data completely
- [ ] Audio files are properly deleted from file system storage
- [ ] All analysis data is removed from database
- [ ] No orphaned database records remain
- [ ] Database constraints are maintained
- [ ] Error handling works for edge cases
- [ ] Logging provides adequate audit trail
- [ ] Data integrity verification passes after deletion

#### Frontend Validation
- [ ] Edit mode works correctly
- [ ] Form validation prevents invalid data
- [ ] Confirmation modals prevent accidental deletions
- [ ] Loading states provide user feedback
- [ ] Error messages are user-friendly
- [ ] RTL layout works properly

#### Integration Validation
- [ ] Dashboard stats update after deletions
- [ ] Customer list refreshes after operations
- [ ] Analysis list updates correctly
- [ ] No orphaned data remains

### 2. Database Validation

#### Data Integrity Checks
```sql
-- Verify no orphaned records
SELECT COUNT(*) FROM sales_calls sc 
LEFT JOIN customers c ON sc.customer_id = c.id 
WHERE c.id IS NULL;

-- Verify customer priorities are accurate
SELECT c.id, c.name, 
       COUNT(sc.id) as actual_calls,
       cp.total_calls as stored_calls
FROM customers c
LEFT JOIN sales_calls sc ON c.id = sc.customer_id
LEFT JOIN customer_priorities cp ON c.id = cp.customer_id
GROUP BY c.id, c.name, cp.total_calls;

-- Verify no orphaned analysis data
SELECT COUNT(*) FROM analysis_data ad
LEFT JOIN sales_calls sc ON ad.sales_call_id = sc.id
WHERE sc.id IS NULL;

-- Verify file system integrity (check for orphaned files)
-- This should be run as a separate script to cross-reference
-- database records with actual files on disk
```

#### File System Validation
```bash
# Check for orphaned audio files
find uploads/ -name "*.mp3" -o -name "*.wav" | while read file; do
  filename=$(basename "$file")
  if ! psql -d your_db -c "SELECT 1 FROM sales_calls WHERE audio_file_path LIKE '%$filename%'" | grep -q 1; then
    echo "Orphaned file: $file"
  fi
done
```

### 3. Performance Validation

#### Load Testing
- [ ] Customer deletion with 100+ recordings
- [ ] Concurrent edit operations
- [ ] Large file deletion performance
- [ ] Database query performance after operations

#### Memory Usage
- [ ] Monitor memory usage during file operations
- [ ] Check for memory leaks in long-running operations
- [ ] Validate garbage collection after deletions

## Deployment Considerations

### 1. Database Backup Strategy
- Ensure automated backups before deployment
- Test restore procedures
- Monitor backup integrity

### 2. File System Considerations
- Verify sufficient disk space for operations
- Check file permissions for deletion operations
- Monitor file system performance

### 3. Monitoring and Alerting
- Add logging for all delete operations
- Monitor for failed deletions
- Alert on unusual deletion patterns

### 4. Rollback Plan
- Database migration rollback procedures
- Frontend deployment rollback
- Data recovery procedures

## Security Considerations

### 1. Authorization
- Ensure only authorized users can delete data
- Log all deletion operations for audit
- Implement rate limiting for delete operations

### 2. Data Protection
- Verify GDPR compliance for data deletion
- Ensure complete data removal
- Maintain audit trails for compliance

### 3. Input Validation
- Validate all input parameters
- Prevent SQL injection
- Sanitize file paths

## Implementation Timeline

### Phase 1: Backend Implementation (1-2 days)
1. Add sales call delete endpoint
2. Enhance customer delete endpoint
3. Add comprehensive logging
4. Write backend tests

### Phase 2: Frontend Implementation (2-3 days)
1. Add API service methods
2. Create confirmation modal component
3. Enhance customer card component
4. Add delete functionality to analysis list
5. Write frontend tests

### Phase 3: Testing and Validation (1-2 days)
1. Run comprehensive test suite
2. Manual testing and validation
3. Performance testing
4. Security review

### Phase 4: Deployment (1 day)
1. Database backup
2. Deploy backend changes
3. Deploy frontend changes
4. Post-deployment validation

## Risk Assessment

### High Risk
- **Data Loss**: Accidental deletion of important data
- **File System Issues**: Orphaned files or permission problems
- **Performance Impact**: Large deletion operations affecting system performance

### Medium Risk
- **UI/UX Issues**: Confusing confirmation dialogs or poor error handling
- **Concurrency Issues**: Multiple users editing same customer
- **Browser Compatibility**: RTL layout issues in different browsers

### Low Risk
- **Minor UI Bugs**: Styling issues or layout problems
- **Performance Degradation**: Slight slowdown in operations

## Success Criteria

### Functional Requirements
- [ ] Users can delete individual recordings with complete data cleanup
- [ ] Users can delete customers with all recordings and complete data removal
- [ ] Users can edit customer information
- [ ] All operations have proper confirmation
- [ ] Error handling works correctly
- [ ] Audio files are completely removed from file system
- [ ] All analysis data is removed from database
- [ ] No orphaned records remain in database

### Non-Functional Requirements
- [ ] Operations complete within 5 seconds
- [ ] No data integrity issues
- [ ] No orphaned files remain in file system
- [ ] No orphaned records remain in database
- [ ] Complete audit trail for all deletion operations
- [ ] UI is responsive and user-friendly
- [ ] File system cleanup is verified after each operation

### Quality Requirements
- [ ] 90%+ test coverage
- [ ] No critical security vulnerabilities
- [ ] Accessibility compliance
- [ ] Mobile responsiveness
- [ ] RTL layout support

## Technical Specifications

### Backend API Endpoints

#### 1. Delete Sales Call
```http
DELETE /api/analyze/:id
Content-Type: application/json

Response:
{
  "success": true,
  "message": "Sales call deleted successfully",
  "data": {
    "deletedSalesCallId": 123,
    "customerId": 456,
    "customerName": "שם הלקוח",
    "audioFilePath": "/path/to/deleted/file.mp3"
  }
}
```

#### 2. Delete Customer (Enhanced)
```http
DELETE /api/customers/:id
Content-Type: application/json

Response:
{
  "success": true,
  "message": "Customer deleted successfully",
  "data": {
    "deletedCustomerId": 456,
    "deletedSalesCalls": 5,
    "deletedAudioFiles": 5
  }
}
```

#### 3. Update Customer (Enhanced)
```http
PUT /api/customers/:id
Content-Type: application/json

{
  "name": "שם חדש",
  "phone": "050-1234567",
  "email": "new@email.com"
}

Response:
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "customer": {
      "id": 456,
      "name": "שם חדש",
      "phone": "050-1234567",
      "email": "new@email.com",
      "createdAt": "2024-12-19T10:00:00Z"
    }
  }
}
```

### Frontend Components

#### 1. CustomerCard Component Structure
```typescript
interface CustomerCardProps {
  customer: Customer;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customerId: number) => void;
}

interface CustomerCardState {
  isEditing: boolean;
  editData: {
    name: string;
    phone: string;
    email: string;
  };
  showDeleteConfirm: boolean;
  isLoading: boolean;
}
```

#### 2. ConfirmationModal Component Structure
```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}
```

### Database Operations

#### 1. Sales Call Deletion
```sql
-- 1. Get sales call details and audio file path
SELECT sc.*, c.name as customer_name 
FROM sales_calls sc 
JOIN customers c ON sc.customer_id = c.id 
WHERE sc.id = ?;

-- 2. Delete analysis data first (if exists)
DELETE FROM analysis_data WHERE sales_call_id = ?;

-- 3. Delete sales call (cascade handled by Prisma)
DELETE FROM sales_calls WHERE id = ?;

-- 4. Update customer priorities
UPDATE customer_priorities 
SET total_calls = total_calls - 1,
    avg_overall_score = (
      SELECT AVG(overall_score) 
      FROM sales_calls 
      WHERE customer_id = ?
    )
WHERE customer_id = ?;

-- 5. Verify deletion (no orphaned records)
SELECT COUNT(*) FROM analysis_data WHERE sales_call_id = ?;
```

#### 2. Customer Deletion
```sql
-- 1. Get customer details and count recordings
SELECT c.*, COUNT(sc.id) as sales_calls_count,
       GROUP_CONCAT(sc.audio_file_path) as audio_files
FROM customers c
LEFT JOIN sales_calls sc ON c.id = sc.customer_id
WHERE c.id = ?
GROUP BY c.id;

-- 2. Delete analysis data for all customer recordings
DELETE ad FROM analysis_data ad
JOIN sales_calls sc ON ad.sales_call_id = sc.id
WHERE sc.customer_id = ?;

-- 3. Delete customer (cascade deletes sales_calls and customer_priorities)
DELETE FROM customers WHERE id = ?;

-- 4. Verify complete deletion
SELECT COUNT(*) FROM sales_calls WHERE customer_id = ?;
SELECT COUNT(*) FROM analysis_data ad
JOIN sales_calls sc ON ad.sales_call_id = sc.id
WHERE sc.customer_id = ?;
```

## Error Handling Strategy

### Backend Error Handling
```javascript
// File system errors
try {
  await fs.remove(audioFilePath);
  console.log(`✅ Audio file deleted: ${audioFilePath}`);
} catch (fileError) {
  console.warn(`⚠️ Warning: Could not delete audio file: ${audioFilePath}`, fileError.message);
  // Continue with database deletion but log the issue
}

// Analysis data cleanup
try {
  await prisma.analysisData.deleteMany({ where: { salesCallId: id } });
  console.log(`✅ Analysis data deleted for sales call: ${id}`);
} catch (analysisError) {
  console.warn(`⚠️ Warning: Could not delete analysis data: ${analysisError.message}`);
  // Continue with main deletion
}

// Database errors
try {
  await prisma.salesCall.delete({ where: { id } });
  console.log(`✅ Sales call deleted from database: ${id}`);
} catch (dbError) {
  if (dbError.code === 'P2025') {
    return res.status(404).json({ error: true, message: 'Sales call not found' });
  }
  throw dbError;
}

// Verification
try {
  const remainingData = await prisma.analysisData.findFirst({ where: { salesCallId: id } });
  if (remainingData) {
    console.error(`❌ Orphaned analysis data found after deletion: ${id}`);
  }
} catch (verifyError) {
  console.warn(`⚠️ Could not verify deletion: ${verifyError.message}`);
}
```

### Frontend Error Handling
```typescript
// API error handling
const handleError = (error: any) => {
  if (error.response?.status === 404) {
    setError('Item not found');
  } else if (error.response?.status === 409) {
    setError('Phone number already exists');
  } else {
    setError('An unexpected error occurred');
  }
};

// Form validation
const validateForm = (data: CustomerData) => {
  const errors: string[] = [];
  if (!data.name.trim()) errors.push('Name is required');
  if (!data.phone.trim()) errors.push('Phone is required');
  if (data.email && !isValidEmail(data.email)) errors.push('Invalid email format');
  return errors;
};
```

## Monitoring and Logging

### Backend Logging
```javascript
// Deletion logging
console.log(`🗑️ Starting deletion process for sales call ID: ${id}`);
console.log(`🗑️ Customer: ${customer.name}, Audio file: ${audioFilePath}`);

// File system cleanup logging
console.log(`🗑️ Deleting audio file from storage: ${audioFilePath}`);

// Database cleanup logging
console.log(`🗑️ Deleting analysis data for sales call: ${id}`);
console.log(`🗑️ Deleting sales call record from database: ${id}`);

// Verification logging
console.log(`✅ Sales call deletion completed: ID ${id}`);
console.log(`✅ Audio file deleted: ${audioFilePath}`);
console.log(`✅ Analysis data cleaned up: ${id}`);

// Error logging
console.error('❌ Error during sales call deletion:', error);
console.error('❌ File system error:', fileError);
console.error('❌ Database error:', dbError);
```

### Frontend Logging
```typescript
// User action logging
console.log('User initiated customer deletion:', customerId);
console.log('User confirmed customer deletion');
console.log('Customer deletion completed successfully');
```

## Accessibility Considerations

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order should be logical
- Escape key should close modals

### Screen Reader Support
- Proper ARIA labels for all interactive elements
- Descriptive error messages
- Confirmation dialogs with clear purpose

### RTL Support
- All text and layouts must support Hebrew RTL
- Icons and buttons should be properly positioned
- Form validation messages in Hebrew

## Performance Optimization

### Backend Optimizations
- Use database transactions for related operations
- Implement proper indexing for deletion queries
- Batch file system operations where possible

### Frontend Optimizations
- Implement optimistic updates for better UX
- Use React.memo for expensive components
- Debounce form input changes

## Future Enhancements

### Planned Features
- Bulk delete operations
- Undo deletion functionality
- Advanced search and filtering
- Export deleted data for compliance

### Technical Improvements
- Implement soft deletes for audit trails
- Add file compression for storage optimization
- Implement CDN for audio file delivery

---

*This implementation plan serves as a comprehensive guide for developing the customer and recording management features. It ensures that all aspects of the implementation are considered, from technical requirements to user experience and security considerations.*

**Last Updated**: December 19, 2024
**Version**: 1.0
**Next Review**: Before implementation begins


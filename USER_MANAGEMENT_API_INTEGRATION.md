# User Management API Integration

**Date**: January 22, 2026
**Frontend Version**: 1.0.0
**Backend API Version**: 1.0.0
**Status**: ✅ Complete

---

## Overview

This document outlines the complete integration of the frontend User Management module with the TRAB Case Repository Backend User Management API.

## API Endpoints Used

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints Integrated

| Endpoint | Method | Authentication | Purpose | Frontend File |
|----------|--------|----------------|---------|---------------|
| `/auth/register` | POST | Not required | Register new user | `UserManagement.vue` (saveUser) |
| `/auth/login` | POST | Not required | User login | `Login.vue` |
| `/auth/users` | GET | Required | Get all users | `UserManagement.vue` (onMounted) |
| `/auth/me` | GET | Required | Get current user profile | `AuthService.js` |
| `/auth/change-password` | POST | Required | Change password | `UserManagement.vue` (handleChangePassword) |
| `/auth/refresh` | POST | Not required | Refresh access token | `AuthService.js` |
| `/auth/logout` | POST | Required | Logout user | `AppTopbar.vue` |

---

## Data Model Alignment

### Backend RegisterDto Structure
Based on `/src/modules/auth/dto/register.dto.ts`:

```typescript
{
  email: string;           // Required - Valid email
  password: string;        // Required - Min 8 chars, uppercase, lowercase, number
  firstName: string;       // Required - Min 2 chars
  lastName: string;        // Required - Min 2 chars
  phoneNumber?: string;    // Optional - e.g., "+255712345678"
  organization?: string;   // Optional - e.g., "ABC Law Firm"
  tinNumber?: string;      // Optional - Tax ID
  licenseNumber?: string;  // Optional - Professional license
}
```

### Backend User Entity Structure
Based on `/src/modules/users/entities/user.entity.ts`:

```typescript
{
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
  password: string;        // Excluded from API responses
  role: UserRole;          // Enum: admin, lawyer, public
  status: UserStatus;      // Enum: active, inactive, suspended
  phoneNumber: string | null;
  organization: string | null;
  tinNumber: string | null;
  licenseNumber: string | null;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Frontend Changes Made

#### ❌ Old (Incorrect) Structure
```javascript
{
  username: string;        // Doesn't exist in backend!
  name: string;           // Should be firstName + lastName
  checkNumber: string;    // Doesn't exist in backend!
  mobileNumber: string;   // Should be phoneNumber
  rolesList: Array;       // Doesn't exist in backend!
}
```

#### ✅ New (Correct) Structure
```javascript
{
  firstName: string;      // Required
  lastName: string;       // Required
  email: string;          // Required
  password: string;       // Required for new users
  phoneNumber: string;    // Optional
  organization: string;   // Optional
  tinNumber: string;      // Optional
  licenseNumber: string;  // Optional
}
```

---

## Files Modified

### 1. `/src/service/UserManagement.js`

**Change**: Updated API endpoint from `/users` to `/auth/users`

**Before**:
```javascript
async getUsers() {
    return await api
        .get('/users')
        .then((response) => response.data)
        .catch((error) => {
            console.error('Error fetching users:', error);
            throw error;
        });
}
```

**After**:
```javascript
async getUsers() {
    return await api
        .get('/auth/users')  // ✅ Correct endpoint
        .then((response) => response.data)
        .catch((error) => {
            console.error('Error fetching users:', error);
            throw error;
        });
}
```

---

### 2. `/src/views/pages/settings/UserManagement.vue`

#### A. Imports (Lines 1-24)

**Removed**:
```javascript
import { RoleService } from '@/service/RoleService';  // ❌ Removed
const rolesList = ref([]);                             // ❌ Removed
```

**Reason**: Backend automatically sets role to 'public' on registration. Role management is not exposed through the registration API.

---

#### B. Form Initialization (Lines 33-46)

**Before**:
```javascript
function openNew() {
    user.value = {
        rolesList: []
    };
    submitted.value = false;
    userDialog.value = true;
}
```

**After**:
```javascript
function openNew() {
    user.value = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        organization: '',
        tinNumber: '',
        licenseNumber: ''
    };
    submitted.value = false;
    userDialog.value = true;
}
```

**Impact**: Prevents `rolesList.length` undefined error and properly initializes all RegisterDto fields.

---

#### C. Validation Logic (Lines 143-168)

**Added Password Strength Validation**:
```javascript
// Password strength validation for new users
if (!user.value.id && user.value.password) {
    if (user.value.password.length < 8) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Password must be at least 8 characters long',
            life: 3000
        });
        return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(user.value.password)) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Password must contain uppercase, lowercase, and number',
            life: 3000
        });
        return;
    }
}
```

**Regex Breakdown**:
- `(?=.*[a-z])` - At least one lowercase letter
- `(?=.*[A-Z])` - At least one uppercase letter
- `(?=.*\d)` - At least one digit

**Matches Backend Validation** in `register.dto.ts`:
```typescript
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
  message: 'Password must contain uppercase, lowercase, and number',
})
```

---

#### D. Registration Payload (Lines 197-208)

**Before**:
```javascript
const registerData = {
    username: user.value.username,      // ❌ Doesn't exist
    email: user.value.email,
    password: user.value.password,
    name: user.value.name,              // ❌ Should be firstName + lastName
    checkNumber: user.value.checkNumber, // ❌ Doesn't exist
    mobileNumber: user.value.mobileNumber, // ❌ Should be phoneNumber
    rolesList: user.value.rolesList     // ❌ Doesn't exist
};
```

**After**:
```javascript
const registerData = {
    email: user.value.email,
    password: user.value.password,
    firstName: user.value.firstName,
    lastName: user.value.lastName,
    phoneNumber: user.value.phoneNumber || undefined,
    organization: user.value.organization || undefined,
    tinNumber: user.value.tinNumber || undefined,
    licenseNumber: user.value.licenseNumber || undefined
};
```

**Note**: Optional fields are set to `undefined` if empty to prevent sending empty strings to the backend.

---

#### E. DataTable Columns (Lines 273-287)

**Before**:
```vue
<Column field="username" header="User Name" sortable />
<Column field="checkNumber" header="Check Number" sortable />
<Column field="mobileNumber" header="Phone" sortable />
<Column field="name" header="Name" sortable />
<Column header="Roles">
    <template #body="slotProps">
        <Tag v-for="(role, index) in slotProps.data.rolesList"
             :key="index"
             :value="role.name" />
    </template>
</Column>
```

**After**:
```vue
<Column field="firstName" header="First Name" sortable />
<Column field="lastName" header="Last Name" sortable />
<Column field="email" header="Email" sortable />
<Column field="phoneNumber" header="Phone" sortable />
<Column field="role" header="Role" sortable>
    <template #body="slotProps">
        <Tag :value="slotProps.data.role" severity="info" />
    </template>
</Column>
<Column field="status" header="Status" sortable>
    <template #body="slotProps">
        <Tag :value="slotProps.data.status"
             :severity="slotProps.data.status === 'active' ? 'success' : 'warning'" />
    </template>
</Column>
```

**Benefits**:
- Displays actual backend fields
- Shows role as a single value (not array)
- Adds status column with color-coded tags

---

#### F. User Form Dialog (Lines 298-358)

**Before**:
```vue
<div>
    <label for="name">Full name</label>
    <InputText v-model.trim="user.name" />
</div>
<div>
    <label for="username">Username</label>
    <InputText v-model.trim="user.username" />
</div>
<div>
    <label for="checkNumber">Check Number</label>
    <InputText v-model.trim="user.checkNumber" />
</div>
<div>
    <label for="mobileNumber">Mobile Number</label>
    <InputText v-model.trim="user.mobileNumber" />
</div>
<div>
    <label for="roles">Roles</label>
    <MultiSelect v-model="user.rolesList" :options="rolesList" />
</div>
```

**After**:
```vue
<!-- First Name Field -->
<div>
    <label for="firstName">First Name *</label>
    <InputText v-model.trim="user.firstName"
               required
               :invalid="submitted && !user.firstName" />
    <small v-if="submitted && !user.firstName" class="text-red-500">
        First name is required.
    </small>
</div>

<!-- Last Name Field -->
<div>
    <label for="lastName">Last Name *</label>
    <InputText v-model.trim="user.lastName"
               required
               :invalid="submitted && !user.lastName" />
    <small v-if="submitted && !user.lastName" class="text-red-500">
        Last name is required.
    </small>
</div>

<!-- Email Field -->
<div>
    <label for="email">Email *</label>
    <InputText type="email"
               v-model.trim="user.email"
               required
               :invalid="submitted && !user.email" />
    <small v-if="submitted && !user.email" class="text-red-500">
        Email is required.
    </small>
</div>

<!-- Password Field (only for new users) -->
<div v-if="!user.id">
    <label for="password">Password *</label>
    <Password v-model="user.password" :toggleMask="true" :feedback="true" />
    <small v-if="submitted && !user.password" class="text-red-500">
        Password is required for new users.
    </small>
    <small class="block mt-2 text-gray-600">
        Must be at least 8 characters with uppercase, lowercase, and number
    </small>
</div>

<!-- Phone Number Field -->
<div>
    <label for="phoneNumber">Phone Number</label>
    <InputText v-model.trim="user.phoneNumber"
               placeholder="+255712345678" />
</div>

<!-- Organization Field -->
<div>
    <label for="organization">Organization</label>
    <InputText v-model.trim="user.organization"
               placeholder="ABC Law Firm" />
</div>

<!-- TIN Number Field -->
<div>
    <label for="tinNumber">TIN Number</label>
    <InputText v-model.trim="user.tinNumber"
               placeholder="123456789" />
</div>

<!-- License Number Field -->
<div>
    <label for="licenseNumber">License Number</label>
    <InputText v-model.trim="user.licenseNumber"
               placeholder="LAW-2024-001" />
</div>
```

**Changes**:
- ✅ Split "name" into "firstName" and "lastName"
- ✅ Removed "username" and "checkNumber" fields
- ✅ Changed "mobileNumber" to "phoneNumber"
- ✅ Removed roles MultiSelect (role set automatically to 'public')
- ✅ Added "organization", "tinNumber", "licenseNumber" fields
- ✅ Added password requirements helper text
- ✅ Added placeholders matching API examples
- ✅ Added asterisks (*) for required fields

---

## Authentication Flow

### 1. Registration Flow

```
User fills form → Frontend validates → POST /auth/register → Backend validates →
Create user (role: public) → Return JWT tokens → Store tokens → Redirect to dashboard
```

**Frontend Code**:
```javascript
const registerData = {
    email: user.value.email,
    password: user.value.password,
    firstName: user.value.firstName,
    lastName: user.value.lastName,
    phoneNumber: user.value.phoneNumber || undefined,
    organization: user.value.organization || undefined,
    tinNumber: user.value.tinNumber || undefined,
    licenseNumber: user.value.licenseNumber || undefined
};

AuthService.register(registerData)
    .then((data) => {
        // data contains: { accessToken, refreshToken, user }
        userDialog.value = false;
        user.value = {};
        toast.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'User Registered Successfully',
            life: 3000
        });
        UserService.getUsers().then((data) => (users.value = data));
    })
```

### 2. Fetching Users Flow

```
Component mounts → GET /auth/users (with Bearer token) → Backend returns user array →
Display in DataTable
```

**Frontend Code**:
```javascript
onMounted(() => {
    UserService.getUsers().then((data) => (users.value = data));
});
```

### 3. Change Password Flow

```
User clicks "Change Password" → Fill form → Validate → POST /auth/change-password →
Backend verifies current password → Hash new password → Update → Return success
```

---

## Password Requirements

### Frontend Validation
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)

### Backend Validation
From `register.dto.ts`:
```typescript
@MinLength(8, { message: 'Password must be at least 8 characters long' })
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
  message: 'Password must contain uppercase, lowercase, and number',
})
```

**Both match exactly** ✅

---

## User Roles

### Available Roles (Backend Enum)
```typescript
enum UserRole {
  ADMIN = 'admin',
  LAWYER = 'lawyer',
  PUBLIC = 'public'
}
```

### Default Role
- New users registered through `/auth/register` are assigned `role: 'public'` by default
- Role cannot be set during registration (backend security)
- Role must be updated by admin users through separate admin endpoints (if implemented)

---

## Error Handling

### Common Errors

#### 1. Email Already Exists (409 Conflict)
```json
{
  "message": "User with this email already exists",
  "error": "Conflict",
  "statusCode": 409
}
```

**Frontend Handling**:
```javascript
.catch((error) => {
    const errorMessage = error.response?.data?.message ||
                        error.response?.data?.error ||
                        'An unexpected error occurred. Please try again later.';
    toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,  // Will show "User with this email already exists"
        life: 3000
    });
});
```

#### 2. Password Validation Failure (400 Bad Request)
```json
{
  "message": ["Password must contain uppercase, lowercase, and number"],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Frontend Prevents This**:
- Validation happens before API call
- User sees error message immediately in the form

#### 3. Unauthorized (401)
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**Causes**:
- Missing or invalid access token
- Token expired (15 minutes)

**Solution**: Use refresh token to get new access token

---

## Testing Checklist

### ✅ Registration Tests

- [x] Register user with all required fields
- [x] Register user with optional fields (phone, organization, TIN, license)
- [x] Validate password requirements (min 8 chars)
- [x] Validate password complexity (uppercase, lowercase, number)
- [x] Test duplicate email error handling
- [x] Verify user appears in users list after registration
- [x] Verify role is set to 'public' automatically

### ✅ User List Tests

- [x] Fetch all users on component mount
- [x] Display firstName, lastName, email, phoneNumber
- [x] Display role with colored tag
- [x] Display status with colored tag (active = green, inactive = yellow)
- [x] Verify password is not displayed in table

### ✅ Form Validation Tests

- [x] First name required validation
- [x] Last name required validation
- [x] Email required validation
- [x] Email format validation
- [x] Password required for new users only
- [x] Password hidden when editing existing user
- [x] Optional fields can be empty

### ✅ API Integration Tests

- [x] Correct endpoint used: `/auth/users` (not `/users`)
- [x] Correct payload structure matches RegisterDto
- [x] JWT token included in Authorization header
- [x] Error messages displayed from API responses

---

## API Response Examples

### Successful Registration
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "public",
    "status": "active"
  }
}
```

### Get All Users Response
```json
[
  {
    "id": "0ce06f5c-cd31-4622-a5b4-736c9b7ef434",
    "firstName": "System",
    "lastName": "Administrator",
    "email": "admin@trab.go.tz",
    "role": "public",
    "status": "active",
    "phoneNumber": null,
    "organization": null,
    "tinNumber": null,
    "licenseNumber": null,
    "emailVerified": false,
    "lastLoginAt": null,
    "createdAt": "2026-01-21T18:24:11.753Z",
    "updatedAt": "2026-01-22T08:47:32.462Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "lawyer",
    "status": "active",
    "phoneNumber": "+255712345678",
    "organization": "ABC Law Firm",
    "tinNumber": "123-456-789",
    "licenseNumber": "LAW-2024-001",
    "emailVerified": true,
    "lastLoginAt": "2026-01-22T10:30:00.000Z",
    "createdAt": "2026-01-22T08:00:00.000Z",
    "updatedAt": "2026-01-22T10:30:00.000Z"
  }
]
```

**Note**: `password` field is excluded from all responses via `@Exclude()` decorator in backend.

---

## Security Considerations

### ✅ Implemented

1. **Password Never Displayed**
   - Password field only shown for new user creation
   - Not shown when editing existing users
   - Not returned in API responses

2. **Password Validation**
   - Frontend validates before API call
   - Backend validates again (defense in depth)

3. **JWT Token Authentication**
   - Tokens required for fetching users
   - Tokens stored in localStorage (temporary for development)
   - Authorization header included automatically via axios interceptor

4. **Error Message Sanitization**
   - Display user-friendly messages from API
   - Don't expose sensitive information

### 🔄 To Be Implemented (Production)

1. **Move tokens to httpOnly cookies** (prevent XSS attacks)
2. **Implement HTTPS** (encrypt data in transit)
3. **Add CSRF protection** (prevent cross-site request forgery)
4. **Implement rate limiting** (prevent brute force attacks)
5. **Add email verification** (verify user email addresses)

---

## Development vs Production

### Current State (Development)
```javascript
// Api.js - TEMPORARILY DISABLED
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // DISABLED: Don't redirect to login if no token during development
        return config;
    }
);
```

### Production State (To Be Enabled)
```javascript
// Api.js - RE-ENABLE FOR PRODUCTION
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            window.location.href = '/login';  // Enforce authentication
        }
        return config;
    }
);
```

---

## Summary of Changes

### Files Modified: 3

1. **`/src/service/UserManagement.js`**
   - Changed endpoint from `/users` to `/auth/users`

2. **`/src/views/pages/settings/UserManagement.vue`**
   - Updated form fields to match RegisterDto
   - Added password strength validation
   - Fixed registration payload structure
   - Updated DataTable columns
   - Removed role management (handled by backend)

3. **Created: `/USER_MANAGEMENT_API_INTEGRATION.md`**
   - This comprehensive documentation

### Breaking Changes: 0
- All changes are backward compatible with development mode
- No changes to authentication interceptors
- No changes to existing API service methods

### New Features: 4
1. ✅ Password strength validation with visual feedback
2. ✅ Optional fields (organization, TIN, license)
3. ✅ Status display with color-coded tags
4. ✅ Proper error message handling from API

---

## Next Steps

### Immediate (Required for Basic Functionality)
1. ✅ Test user registration with backend running
2. ✅ Test fetching users list
3. ✅ Verify password validation works
4. ✅ Test error handling for duplicate emails

### Short-term (Enhanced Functionality)
1. ⏳ Implement user editing (PATCH endpoint)
2. ⏳ Implement user deletion (DELETE endpoint)
3. ⏳ Implement password reset functionality
4. ⏳ Add role management for admin users

### Long-term (Production Readiness)
1. 🔄 Re-enable authentication interceptors
2. 🔄 Implement proper token refresh flow
3. 🔄 Move tokens to httpOnly cookies
4. 🔄 Add email verification flow
5. 🔄 Implement HTTPS
6. 🔄 Add comprehensive error logging

---

## References

- Backend API Documentation: `User Management API Documentation.md`
- Backend RegisterDto: `/src/modules/auth/dto/register.dto.ts`
- Backend User Entity: `/src/modules/users/entities/user.entity.ts`
- Backend Auth Controller: `/src/modules/auth/auth.controller.ts`
- Frontend Auth Service: `/src/service/AuthService.js`
- Frontend User Service: `/src/service/UserManagement.js`
- Frontend User Management: `/src/views/pages/settings/UserManagement.vue`

---

**Document Version**: 1.0.0
**Last Updated**: January 22, 2026
**Status**: ✅ Complete and Verified

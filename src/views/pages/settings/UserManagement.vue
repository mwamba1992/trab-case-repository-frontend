<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { UserService } from '@/service/UserManagement';
import AuthService from '@/service/AuthService';

const user = ref({});
const toast = useToast();
const dt = ref();
const users = ref([]);
const submitted = ref(false);
const userDialog = ref(false);
const selectedUsers = ref();
const changePasswordDialog = ref(false);
const passwordData = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// User roles options
const userRoles = ref([
    { label: 'Admin', value: 'admin', description: 'Full system access' },
    { label: 'Registry', value: 'registry', description: 'Case registration and management' },
    { label: 'Deciders', value: 'deciders', description: 'View cases and decisions' },
    { label: 'Custodian', value: 'custodian', description: 'Document management' },
    { label: 'Console', value: 'console', description: 'Read-only access - logs and monitoring only' }
]);

onMounted(() => {
    UserService.getUsers().then((data) => (users.value = data));
});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

function openNew() {
    user.value = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        checkNumber: '',
        role: 'registry' // Default role
    };
    submitted.value = false;
    userDialog.value = true;
}

function hideDialog() {
    userDialog.value = false;
    submitted.value = false;
    user.value = {};
}

function exportCSV() {
    dt.value.exportCSV();
}

function editUser(usr) {
    console.log(usr);
    user.value = { ...usr };
    console.log(user.value);

    // Don't show password field when editing
    delete user.value.password;

    userDialog.value = true;
}

function deleteUser(usr) {}

function resetPassword(user) {
    console.log(user);
    UserService.resetPassword(user.id)
        .then((data) => {
            if (data.error) {
                toast.add({ severity: 'error', summary: 'Error', detail: data.error, life: 3000 });
            } else {
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Password Reset', life: 3000 });
            }
        })
        .catch((error) => {
            console.log(error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'An unexpected error occurred. Please try again later.',
                life: 3000
            });
        });
}
function openChangePassword() {
    passwordData.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };
    changePasswordDialog.value = true;
}

function hidePasswordDialog() {
    changePasswordDialog.value = false;
    passwordData.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };
}

async function handleChangePassword() {
    if (!passwordData.value.currentPassword || !passwordData.value.newPassword || !passwordData.value.confirmPassword) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'All password fields are required', life: 3000 });
        return;
    }

    if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'New passwords do not match', life: 3000 });
        return;
    }

    if (passwordData.value.newPassword.length < 6) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Password must be at least 6 characters long', life: 3000 });
        return;
    }

    try {
        await AuthService.changePassword(passwordData.value.currentPassword, passwordData.value.newPassword);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Password changed successfully', life: 3000 });
        hidePasswordDialog();
    } catch (error) {
        console.log(error);
        const errorMessage = error.response?.data?.message ||
                            error.response?.data?.error ||
                            'Failed to change password. Please try again.';
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 3000
        });
    }
}

function saveUser() {
    submitted.value = true;

    // Validation for required fields
    if (!user.value.firstName?.trim() || !user.value.lastName?.trim() || !user.value.email?.trim()) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'First name, last name, and email are required', life: 3000 });
        return;
    }

    // Validation for role
    if (!user.value.role) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Please select a user role', life: 3000 });
        return;
    }

    // Validation for new users (require password)
    if (!user.value.id && !user.value.password) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Password is required for new users', life: 3000 });
        return;
    }

    // Password strength validation for new users
    if (!user.value.id && user.value.password) {
        if (user.value.password.length < 8) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Password must be at least 8 characters long', life: 3000 });
            return;
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(user.value.password)) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Password must contain uppercase, lowercase, and number', life: 3000 });
            return;
        }
    }

    if (user.value.id) {
        // Update existing user
        UserService.updateUser(user.value)
            .then((data) => {
                if (data.error) {
                    toast.add({ severity: 'error', summary: 'Error', detail: data.error, life: 3000 });
                } else {
                    userDialog.value = false;
                    users.value = [...users.value];
                    user.value = {};
                    toast.add({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 });
                    UserService.getUsers().then((data) => (users.value = data));
                }
            })
            .catch((error) => {
                console.log(error);
                const errorMessage = error.response?.data?.message ||
                                    error.response?.data?.error ||
                                    'An unexpected error occurred. Please try again later.';
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage,
                    life: 3000
                });
            });
    } else {
        // Use AuthService.register for new user creation
        // Map frontend fields to backend RegisterDto
        const registerData = {
            email: user.value.email,
            password: user.value.password,
            firstName: user.value.firstName,
            lastName: user.value.lastName,
            phoneNumber: user.value.phoneNumber || user.value.checkNumber || undefined,
            role: user.value.role
        };

        AuthService.register(registerData)
            .then((data) => {
                if (data.error) {
                    toast.add({ severity: 'error', summary: 'Error', detail: data.error, life: 3000 });
                } else {
                    userDialog.value = false;
                    user.value = {};
                    toast.add({ severity: 'success', summary: 'Successful', detail: 'User Registered Successfully', life: 3000 });
                    UserService.getUsers().then((data) => (users.value = data));
                }
            })
            .catch((error) => {
                console.log(error);
                const errorMessage = error.response?.data?.message ||
                                    error.response?.data?.error ||
                                    'An unexpected error occurred. Please try again later.';
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage,
                    life: 3000
                });
            });
    }
}
</script>

<template>
    <Toolbar class="mb-6">
        <template #start>
            <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
            <Button label="Change Password" icon="pi pi-key" severity="secondary" @click="openChangePassword" />
        </template>

        <template #end>
            <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
        </template>
    </Toolbar>

    <DataTable
        ref="dt"
        v-model:selection="selectedUsers"
        :value="users"
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
    >
        <template #header>
            <div class="flex flex-wrap gap-2 items-center justify-between">
                <h4 class="m-0">Manage Users</h4>
                <IconField>
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </IconField>
            </div>
        </template>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="firstName" header="First Name" sortable style="min-width: 12rem"></Column>
        <Column field="lastName" header="Last Name" sortable style="min-width: 12rem"></Column>
        <Column field="email" header="Email" sortable style="min-width: 16rem"></Column>
        <Column field="phoneNumber" header="Phone" sortable style="min-width: 12rem"></Column>
        <Column field="role" header="Role" sortable style="min-width: 10rem">
            <template #body="slotProps">
                <Tag :value="slotProps.data.role" severity="info" />
            </template>
        </Column>
        <Column field="status" header="Status" sortable style="min-width: 10rem">
            <template #body="slotProps">
                <Tag :value="slotProps.data.status" :severity="slotProps.data.status === 'active' ? 'success' : 'warning'" />
            </template>
        </Column>

        <Column :exportable="false" style="min-width: 12rem">
            <template #body="slotProps">
                <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editUser(slotProps.data)" />
                <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteUser(slotProps.data)" />
                <Button icon="pi pi-undo" outlined rounded @click="resetPassword(slotProps.data)" />
            </template>
        </Column>
    </DataTable>

    <Dialog v-model:visible="userDialog" :style="{ width: '800px' }" :modal="true" :dismissableMask="true" class="user-dialog">
        <template #header>
            <div class="dialog-header-content">
                <div class="header-icon">
                    <i :class="user.id ? 'pi pi-user-edit' : 'pi pi-user-plus'"></i>
                </div>
                <div class="header-text">
                    <h3>{{ user.id ? 'Edit User' : 'Create New User' }}</h3>
                    <p>{{ user.id ? 'Update user information' : 'Add a new user to the system' }}</p>
                </div>
            </div>
        </template>

        <div class="user-form">
            <!-- Section: Personal Information -->
            <div class="form-section">
                <div class="section-header">
                    <i class="pi pi-user section-icon"></i>
                    <h4 class="section-title">Personal Information</h4>
                </div>

                <div class="form-grid">
                    <!-- First Name Field -->
                    <div class="form-field">
                        <label for="firstName" class="field-label">
                            First Name <span class="required-asterisk">*</span>
                        </label>
                        <InputText
                            id="firstName"
                            v-model.trim="user.firstName"
                            autofocus
                            :invalid="submitted && !user.firstName"
                            placeholder="Enter first name"
                            class="input-field"
                        />
                        <small v-if="submitted && !user.firstName" class="error-message">
                            <i class="pi pi-exclamation-circle"></i> First name is required
                        </small>
                    </div>

                    <!-- Last Name Field -->
                    <div class="form-field">
                        <label for="lastName" class="field-label">
                            Last Name <span class="required-asterisk">*</span>
                        </label>
                        <InputText
                            id="lastName"
                            v-model.trim="user.lastName"
                            :invalid="submitted && !user.lastName"
                            placeholder="Enter last name"
                            class="input-field"
                        />
                        <small v-if="submitted && !user.lastName" class="error-message">
                            <i class="pi pi-exclamation-circle"></i> Last name is required
                        </small>
                    </div>
                </div>
            </div>

            <!-- Section: Account Credentials -->
            <div class="form-section">
                <div class="section-header">
                    <i class="pi pi-shield section-icon"></i>
                    <h4 class="section-title">Account Credentials</h4>
                </div>

                <div class="form-grid">
                    <!-- Email Field -->
                    <div class="form-field full-width">
                        <label for="email" class="field-label">
                            Email Address <span class="required-asterisk">*</span>
                        </label>
                        <div class="input-with-icon">
                            <i class="pi pi-envelope input-icon-left"></i>
                            <InputText
                                type="email"
                                id="email"
                                v-model.trim="user.email"
                                :invalid="submitted && !user.email"
                                placeholder="user@example.com"
                                class="input-field with-left-icon"
                            />
                        </div>
                        <small v-if="submitted && !user.email" class="error-message">
                            <i class="pi pi-exclamation-circle"></i> Valid email address is required
                        </small>
                    </div>

                    <!-- Password Field (only for new users) -->
                    <div v-if="!user.id" class="form-field full-width">
                        <label for="password" class="field-label">
                            Password <span class="required-asterisk">*</span>
                        </label>
                        <Password
                            id="password"
                            v-model="user.password"
                            :toggleMask="true"
                            :feedback="true"
                            placeholder="Enter secure password"
                            class="password-field"
                            :class="{ 'p-invalid': submitted && !user.password }"
                        >
                            <template #header>
                                <h6 class="password-meter-header">Password Strength</h6>
                            </template>
                            <template #footer>
                                <div class="password-requirements">
                                    <p class="requirement-title">Password must contain:</p>
                                    <ul class="requirements-list">
                                        <li :class="{ 'met': user.password && user.password.length >= 8 }">
                                            <i :class="user.password && user.password.length >= 8 ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
                                            At least 8 characters
                                        </li>
                                        <li :class="{ 'met': user.password && /[A-Z]/.test(user.password) }">
                                            <i :class="user.password && /[A-Z]/.test(user.password) ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
                                            One uppercase letter
                                        </li>
                                        <li :class="{ 'met': user.password && /[a-z]/.test(user.password) }">
                                            <i :class="user.password && /[a-z]/.test(user.password) ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
                                            One lowercase letter
                                        </li>
                                        <li :class="{ 'met': user.password && /\d/.test(user.password) }">
                                            <i :class="user.password && /\d/.test(user.password) ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
                                            One number
                                        </li>
                                    </ul>
                                </div>
                            </template>
                        </Password>
                        <small v-if="submitted && !user.password" class="error-message">
                            <i class="pi pi-exclamation-circle"></i> Password is required for new users
                        </small>
                    </div>

                    <!-- Role Field -->
                    <div class="form-field full-width">
                        <label for="role" class="field-label">
                            User Role <span class="required-asterisk">*</span>
                        </label>
                        <div class="input-with-icon">
                            <i class="pi pi-users input-icon-left"></i>
                            <Dropdown
                                id="role"
                                v-model="user.role"
                                :options="userRoles"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Select user role"
                                :invalid="submitted && !user.role"
                                class="role-dropdown"
                            >
                                <template #value="slotProps">
                                    <div v-if="slotProps.value" class="role-option">
                                        <i class="pi pi-user role-icon"></i>
                                        <span>{{ userRoles.find(r => r.value === slotProps.value)?.label }}</span>
                                    </div>
                                    <span v-else class="placeholder-text">{{ slotProps.placeholder }}</span>
                                </template>
                                <template #option="slotProps">
                                    <div class="role-option">
                                        <i class="pi pi-user role-icon"></i>
                                        <span>{{ slotProps.option.label }}</span>
                                    </div>
                                </template>
                            </Dropdown>
                        </div>
                        <small v-if="submitted && !user.role" class="error-message">
                            <i class="pi pi-exclamation-circle"></i> User role is required
                        </small>
                        <small class="field-hint">
                            <i class="pi pi-info-circle"></i>
                            Assign the appropriate role based on user responsibilities
                        </small>
                    </div>
                </div>
            </div>

            <!-- Section: Contact Information -->
            <div class="form-section">
                <div class="section-header">
                    <i class="pi pi-phone section-icon"></i>
                    <h4 class="section-title">Contact Information</h4>
                </div>

                <div class="form-grid">
                    <!-- Check Number Field -->
                    <div class="form-field">
                        <label for="checkNumber" class="field-label">
                            Check Number
                        </label>
                        <div class="input-with-icon">
                            <i class="pi pi-id-card input-icon-left"></i>
                            <InputText
                                id="checkNumber"
                                v-model.trim="user.checkNumber"
                                placeholder="Enter check number"
                                class="input-field with-left-icon"
                            />
                        </div>
                    </div>

                    <!-- Phone Number Field -->
                    <div class="form-field">
                        <label for="phoneNumber" class="field-label">
                            Phone Number
                        </label>
                        <div class="input-with-icon">
                            <i class="pi pi-phone input-icon-left"></i>
                            <InputText
                                id="phoneNumber"
                                v-model.trim="user.phoneNumber"
                                placeholder="+255 712 345 678"
                                class="input-field with-left-icon"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <Button
                    label="Cancel"
                    icon="pi pi-times"
                    severity="secondary"
                    text
                    @click="hideDialog"
                    class="footer-button cancel-button"
                />
                <Button
                    :label="user.id ? 'Update User' : 'Create User'"
                    :icon="user.id ? 'pi pi-check' : 'pi pi-user-plus'"
                    @click="saveUser"
                    class="footer-button save-button"
                />
            </div>
        </template>
    </Dialog>

    <!-- Change Password Dialog -->
    <Dialog v-model:visible="changePasswordDialog" :style="{ width: '500px' }" header="Change Password" :modal="true">
        <div class="flex flex-col gap-6">
            <div>
                <label for="currentPassword" class="block font-bold mb-3">Current Password</label>
                <Password id="currentPassword" v-model="passwordData.currentPassword" :feedback="false" :toggleMask="true" fluid />
            </div>

            <div>
                <label for="newPassword" class="block font-bold mb-3">New Password</label>
                <Password id="newPassword" v-model="passwordData.newPassword" :toggleMask="true" fluid />
            </div>

            <div>
                <label for="confirmPassword" class="block font-bold mb-3">Confirm New Password</label>
                <Password id="confirmPassword" v-model="passwordData.confirmPassword" :feedback="false" :toggleMask="true" fluid />
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="hidePasswordDialog" />
            <Button label="Change Password" icon="pi pi-check" @click="handleChangePassword" />
        </template>
    </Dialog>
</template>

<style scoped>
/* Government Enterprise Table Styling - Matching Dashboard */

/* Card wrapper for the page */
:deep(.p-datatable) {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Table Header Styling */
:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: #F8FAFC;
    color: #1B365D;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    border-color: #E2E8F0;
    padding: 1rem;
}

/* Table Body Styling */
:deep(.p-datatable .p-datatable-tbody > tr) {
    border-color: #E2E8F0;
    transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: #F8FAFC;
}

:deep(.p-datatable .p-datatable-tbody > tr.p-row-odd) {
    background-color: #FAFBFC;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 1rem;
    color: #334155;
    font-size: 0.875rem;
}

/* Table Header Custom Styling */
:deep(.p-datatable .p-datatable-header) {
    background: #FFFFFF;
    border: none;
    padding: 1.5rem;
    border-bottom: 1px solid #E2E8F0;
}

:deep(.p-datatable .p-datatable-header h4) {
    color: #1B365D;
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
}

/* Search Input Styling */
:deep(.p-iconfield input) {
    border: 1px solid #D1D5DB;
    border-radius: 4px;
    padding: 0.5rem 0.75rem 0.5rem 2.5rem;
    font-size: 0.875rem;
    transition: all 0.2s;
}

:deep(.p-iconfield input:hover) {
    border-color: #9CA3AF;
}

:deep(.p-iconfield input:focus) {
    border-color: #1B365D;
    box-shadow: 0 0 0 3px rgba(27, 54, 93, 0.1);
}

/* Paginator Styling */
:deep(.p-datatable .p-datatable-footer),
:deep(.p-paginator) {
    background: #F8FAFC;
    border-color: #E2E8F0;
    padding: 1rem 1.5rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
    min-width: 2.5rem;
    height: 2.5rem;
    border-radius: 4px;
    color: #64748B;
    font-weight: 600;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
    background: #1B365D;
    border-color: #1B365D;
    color: #FFFFFF;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:not(.p-highlight):hover) {
    background: #E2E8F0;
    color: #1B365D;
}

/* Toolbar Styling */
:deep(.p-toolbar) {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    padding: 1rem 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Button Styling */
:deep(.p-button) {
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.875rem;
    padding: 0.625rem 1.25rem;
    transition: all 0.2s;
}

:deep(.p-button.p-button-secondary) {
    background: #1B365D;
    border-color: #1B365D;
}

:deep(.p-button.p-button-secondary:hover) {
    background: #0F2642;
    border-color: #0F2642;
}

:deep(.p-button.p-button-outlined) {
    border-width: 1px;
}

/* Action Buttons in Table */
:deep(.p-button.p-button-rounded) {
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
}

/* Tag Styling for Roles */
:deep(.p-tag) {
    background: #E0E7FF;
    color: #3730A3;
    font-weight: 600;
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
    border-radius: 4px;
}

/* Dialog Styling */
:deep(.p-dialog) {
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

:deep(.p-dialog .p-dialog-header) {
    background: #F8FAFC;
    color: #1B365D;
    font-weight: 700;
    padding: 1.5rem;
    border-bottom: 1px solid #E2E8F0;
}

:deep(.p-dialog .p-dialog-content) {
    padding: 1.5rem;
}

:deep(.p-dialog .p-dialog-footer) {
    background: #F8FAFC;
    padding: 1rem 1.5rem;
    border-top: 1px solid #E2E8F0;
}

/* Form Input Styling in Dialog */
:deep(.p-inputtext) {
    border: 1px solid #D1D5DB;
    border-radius: 4px;
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    transition: all 0.2s;
}

:deep(.p-inputtext:hover) {
    border-color: #9CA3AF;
}

:deep(.p-inputtext:focus) {
    border-color: #1B365D;
    box-shadow: 0 0 0 3px rgba(27, 54, 93, 0.1);
}

/* Password Input Styling */
:deep(.p-password input) {
    border: 1px solid #D1D5DB;
    border-radius: 4px;
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    transition: all 0.2s;
}

:deep(.p-password input:hover) {
    border-color: #9CA3AF;
}

:deep(.p-password input:focus) {
    border-color: #1B365D;
    box-shadow: 0 0 0 3px rgba(27, 54, 93, 0.1);
}

/* MultiSelect Styling */
:deep(.p-multiselect) {
    border: 1px solid #D1D5DB;
    border-radius: 4px;
}

:deep(.p-multiselect:hover) {
    border-color: #9CA3AF;
}

:deep(.p-multiselect.p-focus) {
    border-color: #1B365D;
    box-shadow: 0 0 0 3px rgba(27, 54, 93, 0.1);
}

/* Labels */
label {
    color: #1B365D;
    font-weight: 600;
    font-size: 0.875rem;
}

/* General Page Container */
.user-management-container {
    padding: 1.5rem;
}

/* ========================================
   PROFESSIONAL MODAL STYLING
   ======================================== */

/* Dialog Header */
.dialog-header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
}

.header-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #1B365D 0%, #2A4A7C 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.header-icon i {
    font-size: 1.5rem;
    color: #D4AF37;
}

.header-text h3 {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 700;
    color: #1B365D;
    line-height: 1.3;
}

.header-text p {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: #64748B;
    font-weight: 400;
}

/* User Form */
.user-form {
    padding: 0.5rem 0;
}

/* Form Sections */
.form-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #E2E8F0;
}

.form-section:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
}

.section-icon {
    font-size: 1.125rem;
    color: #1B365D;
    opacity: 0.8;
}

.section-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1B365D;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Form Grid */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
}

/* Form Field */
.form-field {
    display: flex;
    flex-direction: column;
}

.form-field.full-width {
    grid-column: 1 / -1;
}

.field-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #1B365D;
    margin-bottom: 0.5rem;
}

.required-asterisk {
    color: #DC2626;
    margin-left: 2px;
}

/* Input Fields */
.input-field {
    width: 100%;
    height: 2.75rem;
    padding: 0 0.875rem;
    border: 1.5px solid #D1D5DB;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    background: #FFFFFF;
}

.input-field:hover {
    border-color: #9CA3AF;
}

.input-field:focus {
    border-color: #1B365D;
    border-width: 2px;
    padding: 0 calc(0.875rem - 0.5px);
    box-shadow: 0 0 0 3px rgba(27, 54, 93, 0.1);
    outline: none;
}

.input-field.p-invalid,
.input-field:invalid {
    border-color: #DC2626;
}

/* Input with Icon */
.input-with-icon {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon-left {
    position: absolute;
    left: 0.875rem;
    color: #6B7280;
    font-size: 1rem;
    z-index: 1;
    pointer-events: none;
}

.input-field.with-left-icon {
    padding-left: 2.75rem;
}

.input-field.with-left-icon:focus {
    padding-left: calc(2.75rem - 0.5px);
}

/* Password Field Styling */
:deep(.password-field) {
    width: 100%;
}

:deep(.password-field .p-password-input) {
    width: 100%;
    height: 2.75rem;
    padding: 0 3rem 0 0.875rem;
    border: 1.5px solid #D1D5DB;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    background: #FFFFFF;
}

:deep(.password-field .p-password-input:hover) {
    border-color: #9CA3AF;
}

:deep(.password-field .p-password-input:focus) {
    border-color: #1B365D;
    border-width: 2px;
    padding: 0 calc(3rem - 0.5px) 0 calc(0.875rem - 0.5px);
    box-shadow: 0 0 0 3px rgba(27, 54, 93, 0.1);
}

:deep(.password-field.p-invalid .p-password-input) {
    border-color: #DC2626;
}

/* Password Strength Meter */
.password-meter-header {
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #1B365D;
}

.password-requirements {
    padding: 0.75rem 0 0 0;
}

.requirement-title {
    margin: 0 0 0.5rem 0;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #374151;
}

.requirements-list {
    margin: 0;
    padding: 0;
    list-style: none;
}

.requirements-list li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0;
    font-size: 0.8125rem;
    color: #6B7280;
    transition: all 0.2s;
}

.requirements-list li i {
    font-size: 0.875rem;
    color: #9CA3AF;
}

.requirements-list li.met {
    color: #059669;
    font-weight: 500;
}

.requirements-list li.met i {
    color: #059669;
}

/* Error Messages */
.error-message {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.375rem;
    color: #DC2626;
    font-size: 0.8125rem;
    font-weight: 500;
}

.error-message i {
    font-size: 0.875rem;
}

/* Field Hint */
.field-hint {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.375rem;
    color: #6B7280;
    font-size: 0.8125rem;
    font-style: italic;
}

.field-hint i {
    font-size: 0.875rem;
    color: #1B365D;
}

/* Role Dropdown Styling */
:deep(.role-dropdown) {
    width: 100%;
    border: 1.5px solid #D1D5DB;
    border-radius: 6px;
    height: 2.75rem;
    padding-left: 2.75rem;
    transition: all 0.2s ease;
}

:deep(.role-dropdown:hover) {
    border-color: #9CA3AF;
}

:deep(.role-dropdown.p-focus) {
    border-color: #1B365D;
    border-width: 2px;
    box-shadow: 0 0 0 3px rgba(27, 54, 93, 0.1);
}

:deep(.role-dropdown.p-invalid) {
    border-color: #DC2626;
}

:deep(.role-dropdown .p-dropdown-label) {
    padding: 0;
    line-height: 2.75rem;
    display: flex;
    align-items: center;
}

:deep(.role-dropdown .p-dropdown-trigger) {
    width: 2.75rem;
}

.role-option {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0;
}

.role-icon {
    font-size: 0.95rem;
    color: #1B365D;
}

.placeholder-text {
    color: #9CA3AF;
}

/* Dialog Footer */
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.5rem;
}

.footer-button {
    min-width: 120px;
    height: 2.75rem;
    font-weight: 600;
    font-size: 0.9rem;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.cancel-button {
    color: #64748B;
}

.cancel-button:hover {
    background-color: #F1F5F9;
    color: #1B365D;
}

.save-button {
    background: linear-gradient(135deg, #1B365D 0%, #2A4A7C 100%);
    border: none;
    color: #FFFFFF;
    box-shadow: 0 2px 8px rgba(27, 54, 93, 0.25);
}

.save-button:hover {
    background: linear-gradient(135deg, #0F2642 0%, #1B365D 100%);
    box-shadow: 0 4px 12px rgba(27, 54, 93, 0.35);
    transform: translateY(-2px);
}

.save-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(27, 54, 93, 0.25);
}

/* Dialog Overrides */
:deep(.user-dialog .p-dialog-header) {
    background: linear-gradient(to bottom, #FFFFFF 0%, #F8FAFC 100%);
    border-bottom: 2px solid #E2E8F0;
    padding: 1.75rem 2rem;
}

:deep(.user-dialog .p-dialog-content) {
    padding: 2rem;
    background: #FFFFFF;
}

:deep(.user-dialog .p-dialog-footer) {
    background: linear-gradient(to top, #FFFFFF 0%, #F8FAFC 100%);
    border-top: 2px solid #E2E8F0;
    padding: 1.5rem 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }

    .form-field.full-width {
        grid-column: 1;
    }

    :deep(.user-dialog) {
        width: 95vw !important;
        max-width: 95vw !important;
    }

    :deep(.user-dialog .p-dialog-content) {
        padding: 1.5rem;
    }

    :deep(.user-dialog .p-dialog-header),
    :deep(.user-dialog .p-dialog-footer) {
        padding: 1.25rem 1.5rem;
    }

    .header-icon {
        width: 44px;
        height: 44px;
    }

    .header-icon i {
        font-size: 1.25rem;
    }

    .header-text h3 {
        font-size: 1.125rem;
    }

    .header-text p {
        font-size: 0.8125rem;
    }
}
</style>

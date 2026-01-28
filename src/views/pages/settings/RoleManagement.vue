<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { RoleService } from '@/service/RoleService';
import { FilterMatchMode } from '@primevue/core/api';

const role = ref({});
const toast = useToast();
const dt = ref();
const roles = ref([]);
const submitted = ref(false);
const roleDialog = ref(false);
const selectedUsers = ref();
const permissionsList = ref([]);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onMounted(() => {
    RoleService.getRoles().then((data) => (roles.value = data));
    RoleService.getPermissions().then((data) => (permissionsList.value = data));
});

function openNew() {
    role.value = {};
    submitted.value = false;
    roleDialog.value = true;
}

function exportCSV() {
    dt.value.exportCSV();
}

function editRole(selectedRole) {
    role.value = { ...selectedRole };
    const permissions = [];
    role.value.permissions.forEach((permission) => {
        permissions.push(permission.id);
    });
    role.value.permissions = permissions;
    console.log(role.value);
    roleDialog.value = true;
}

function saveRole() {
    submitted.value = true;
    if (role?.value.name?.trim() && role?.value.desc?.trim() && role?.value.permissions.length > 0) {
        if (role.value.id) {
            RoleService.updateRole(role.value)
                .then((data) => {
                    if (data.error) {
                        toast.add({ severity: 'error', summary: 'Error', detail: data.error, life: 3000 });
                    } else {
                        roleDialog.value = false;
                        roles.value = [...roles.value]; // Update roles list
                        role.value = {}; // Clear the form
                        toast.add({ severity: 'success', summary: 'Successful', detail: 'Role Updated', life: 3000 });
                        RoleService.getRoles().then((data) => (roles.value = data));
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
        } else {
            RoleService.createRole(role.value)
                .then((data) => {
                    if (data.error) {
                        toast.add({ severity: 'error', summary: 'Error', detail: data.error, life: 3000 });
                    } else {
                        roleDialog.value = false;
                        roles.value = [...roles.value, data]; // Add the new role to the roles list
                        role.value = {}; // Clear the form
                        toast.add({ severity: 'success', summary: 'Successful', detail: 'Role Created', life: 3000 });
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
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields', life: 3000 });
    }
}

const deleteRoleDialog = ref(false);

function confirmDeleteJudge(rol) {
    role.value = rol;
    // Show the dialog asking for confirmation of deletion
    deleteRoleDialog.value = true;
}

function deleteSelectedRole() {
    console.log(role);

    RoleService.deleteRole(role.value.id)
        .then((data) => {
            if (data.error) {
                toast.add({ severity: 'error', summary: 'Error', detail: data.error, life: 3000 });
            } else {
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Role Deleted', life: 3000 });
                deleteRoleDialog.value = false;
                RoleService.getRoles().then((data) => (roles.value = data));
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
</script>

<template>
    <Toolbar class="mb-6">
        <template #start>
            <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
        </template>

        <template #end>
            <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
        </template>
    </Toolbar>

    <DataTable
        ref="dt"
        v-model:selection="selectedUsers"
        :value="roles"
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        stripedRows
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} roles"
    >
        <template #header>
            <div class="flex flex-wrap gap-2 items-center justify-between">
                <h4 class="m-0">Manage Roles</h4>
                <IconField>
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </IconField>
            </div>
        </template>

        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        <Column field="name" header="Role Name" sortable style="min-width: 12rem"></Column>
        <Column field="desc" header="Description" sortable style="min-width: 16rem"></Column>
        <Column header="Permissions" style="min-width: 20rem">
            <template #body="slotProps">
                <!-- Loop through the roleList of each user and display the roles -->
                <div>
                    <Tag v-for="(permission, index) in slotProps.data.permissions" :key="index" :value="permission.name" class="mr-2" />
                </div>
            </template>
        </Column>

        <Column :exportable="false" style="min-width: 12rem">
            <template #body="slotProps">
                <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editRole(slotProps.data)" />
                <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteJudge(slotProps.data)" />
            </template>
        </Column>
    </DataTable>

    <template>
        <Dialog v-model:visible="roleDialog" :style="{ width: '700px' }" header="Role Details" :modal="true">
            <div class="flex flex-col gap-6">
                <!-- Name Field -->
                <div>
                    <label for="name" class="block font-bold mb-3">Name</label>
                    <InputText id="name" v-model.trim="role.name" required="true" autofocus :invalid="submitted && !role.name" fluid />
                    <small v-if="submitted && !role.name" class="text-red-500">Name is required.</small>
                </div>

                <!-- Description Field -->
                <div>
                    <label for="desc" class="block font-bold mb-3">Description</label>
                    <InputText id="desc" v-model.trim="role.desc" required="true" :invalid="submitted && !role.desc" fluid />
                    <small v-if="submitted && !role.desc" class="text-red-500">Description is required.</small>
                </div>

                <!-- Permissions List -->
                <div>
                    <label for="permissions" class="block font-bold mb-3">Permissions</label>
                    <MultiSelect v-model="role.permissions" :options="permissionsList" optionLabel="name" optionValue="id" placeholder="Select Permissions" display="chip" required />
                    <small v-if="submitted && role.permissions.length === 0" class="text-red-500">At least one permission is required.</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveRole" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteRoleDialog" header="Confirm Deletion" :modal="true" :style="{ width: '400px' }">
            <p>Are you sure you want to delete the selected Role {{ role.name }}</p>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="deleteJudgesDialog = false" />
                <Button label="Delete" icon="pi pi-check" severity="danger" @click="deleteSelectedRole" />
            </template>
        </Dialog>
    </template>
</template>

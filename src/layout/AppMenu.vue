<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const permissionMapping = {
    'Manage Bill': ['Bill'],
    'Manage Settings': ['Common Setup', 'Judge', 'Parties', 'Fees', 'User Management'],
    'Manage Payment': ['Payment'],
    'Manage Notice': ['Notices'],
    'Manage Statement': ['Statements'],
    'Manage Application': ['Applications'],
    'Report Manager': ['Appeal Reports', 'Payment Reports']
};

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
    },
    {
        label: 'TRAB Case Repository',
        items: [
            { label: 'Search Cases', icon: 'pi pi-fw pi-search', to: '/search' },
            { label: 'OCR Management', icon: 'pi pi-fw pi-file', to: '/ocr', adminOnly: true },
            { label: 'Sync from TRAIS', icon: 'pi pi-fw pi-sync', to: '/sync', adminOnly: true }
        ]
    },
    {
        label: 'Settings',
        icon: 'pi pi-fw pi-cog',
        adminOnly: true,
        items: [
            {
                label: 'Users',
                icon: 'pi pi-fw pi-user',
                to: '/user-management/users'
            },
            {
                label: 'Roles',
                icon: 'pi pi-fw pi-users',
                to: '/user-management/roles'
            }
        ]
    }
]);

// Function to filter the menu based on permissions and roles
function filterMenu(model, permissions, userRole) {
    // Handle null or undefined permissions
    const permArray = permissions ? (Array.isArray(permissions) ? permissions : permissions.split(',')) : [];

    // Check if user is admin
    const isAdmin = userRole === 'admin';

    return model
        .map((item) => {
            // Clone the item to avoid mutating the original
            const clonedItem = { ...item };

            // If item is admin-only and user is not admin, skip it
            if (clonedItem.adminOnly && !isAdmin) {
                return null;
            }

            // Check allowed roles for the item
            if (clonedItem.allowedRoles && !clonedItem.allowedRoles.includes(userRole)) {
                return null;
            }

            // Check if the current item has a permission and if the user has that permission
            if (clonedItem.permission && !permArray.includes(clonedItem.permission)) {
                return null; // This item is not allowed
            }

            // Filter the 'items' of the current item based on permissions and roles
            if (clonedItem.items) {
                clonedItem.items = clonedItem.items.filter((subItem) => {
                    // If sub-item is admin-only and user is not admin, skip it
                    if (subItem.adminOnly && !isAdmin) {
                        return false;
                    }

                    // Check allowed roles for sub-item
                    if (subItem.allowedRoles && !subItem.allowedRoles.includes(userRole)) {
                        return false;
                    }

                    // Find the required permission for this item using permissionMapping
                    let requiredPermission = Object.keys(permissionMapping).find((key) => permissionMapping[key].includes(subItem.label));

                    // Check if the user has the permission corresponding to the label
                    return !requiredPermission || permArray.includes(requiredPermission);
                });

                // If no items remain after filtering, hide the parent section
                if (clonedItem.items.length === 0) {
                    return null;
                }
            }

            return clonedItem; // Return the item (can be null if filtered out)
        })
        .filter((item) => item !== null); // Filter out any null items (those that were removed)
}

// Retrieve permissions string and user role from localStorage
const permissions = localStorage.getItem('permissions');
const userRole = localStorage.getItem('userRole');

// Apply the filter to the model
const filteredModel = filterMenu(model.value, permissions, userRole);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in filteredModel" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>

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
            { label: 'OCR Management', icon: 'pi pi-fw pi-file', to: '/ocr' },
            { label: 'Sync from TRAIS', icon: 'pi pi-fw pi-sync', to: '/sync' }
        ]
    },
    {
        label: 'Settings',
        icon: 'pi pi-fw pi-cog',
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

// Function to filter the menu based on permissions
function filterMenu(model, permissions) {
    // Handle null or undefined permissions
    const permArray = permissions ? (Array.isArray(permissions) ? permissions : permissions.split(',')) : [];

    return model
        .map((item) => {
            // Check if the current item has a permission and if the user has that permission
            if (item.permission && !permArray.includes(item.permission)) {
                return null; // This item is not allowed
            }

            // Filter the 'items' of the current item based on permissions
            if (item.items) {
                item.items = item.items.filter((subItem) => {
                    // Find the required permission for this item using permissionMapping
                    let requiredPermission = Object.keys(permissionMapping).find((key) => permissionMapping[key].includes(subItem.label));

                    // Check if the user has the permission corresponding to the label
                    return !requiredPermission || permArray.includes(requiredPermission);
                });
            }

            return item; // Return the item (can be null if filtered out)
        })
        .filter((item) => item !== null); // Filter out any null items (those that were removed)
}
// Retrieve permissions string from localStorage;

// Apply the filter to the model
const filteredModel = filterMenu(model.value, localStorage.getItem('permissions'));
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

<script setup>
import AppMenu from './AppMenu.vue';
</script>

<template>
    <div class="layout-sidebar">
        <app-menu></app-menu>
    </div>
</template>

<style lang="scss" scoped>
/* Government Enterprise Sidebar Styling */
.layout-sidebar {
    background: #FFFFFF !important;
    border-right: 1px solid #E2E8F0 !important;
    box-shadow: 1px 0 3px rgba(0, 0, 0, 0.04) !important;
}

/* Menu styling */
:deep(.layout-menu) {
    padding: 1rem 0.5rem;
}

:deep(.layout-menu > li) {
    margin-bottom: 0.5rem;
}

/* Menu section labels */
:deep(.layout-menu .layout-menuitem-root-text) {
    color: #64748B !important;
    font-weight: 700 !important;
    font-size: 0.75rem !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.75rem 0.5rem !important;
    margin-bottom: 0.25rem;
    opacity: 1 !important;
}

/* Menu item links - Force full opacity */
:deep(.layout-menu ul a) {
    color: #475569 !important;
    font-weight: 500 !important;
    font-size: 0.875rem !important;
    padding: 0.625rem 0.75rem !important;
    border-radius: 4px !important;
    opacity: 1 !important;
    transition: background-color 0.15s ease !important;
}

:deep(.layout-menu ul a:hover) {
    background-color: #F1F5F9 !important;
    color: #1B365D !important;
}

:deep(.layout-menu ul a.active-route) {
    background-color: #1B365D !important;
    color: #FFFFFF !important;
    font-weight: 600 !important;
}

/* Icons - Force full opacity always */
:deep(.layout-menu .layout-menuitem-icon) {
    color: #64748B !important;
    opacity: 1 !important;
    font-size: 1rem !important;
    margin-right: 0.625rem !important;
    transition: none !important;
}

:deep(.layout-menu ul a:hover .layout-menuitem-icon) {
    color: #1B365D !important;
    opacity: 1 !important;
}

:deep(.layout-menu ul a.active-route .layout-menuitem-icon) {
    color: #FFFFFF !important;
    opacity: 1 !important;
}

/* Text labels - Force full opacity */
:deep(.layout-menu .layout-menuitem-text) {
    color: inherit !important;
    opacity: 1 !important;
    transition: none !important;
}

/* Override any transitions that might cause fading */
:deep(.layout-menu *) {
    transition-property: background-color, border-color, color !important;
    transition-duration: 0.15s !important;
}

/* Separator */
:deep(.layout-menu .menu-separator) {
    border-top: 1px solid #E2E8F0 !important;
    margin: 1rem 0;
}

/* Ensure submenu items are always visible */
:deep(.layout-submenu) {
    opacity: 1 !important;
}

:deep(.layout-submenu li) {
    opacity: 1 !important;
}

:deep(.layout-submenu a) {
    opacity: 1 !important;
}
</style>

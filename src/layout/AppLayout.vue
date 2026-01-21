<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed, ref, watch } from 'vue';
import AppFooter from './AppFooter.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';

const { layoutConfig, layoutState, isSidebarActive, resetMenu } = useLayout();

const outsideClickListener = ref(null);

watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

const containerClass = computed(() => {
    return {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive
    };
});

function bindOutsideClickListener() {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                resetMenu();
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
}

function unbindOutsideClickListener() {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
}

function isOutsideClicked(event) {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
}
</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        <app-topbar></app-topbar>
        <app-sidebar></app-sidebar>
        <div class="layout-main-container">
            <div class="layout-main">
                <router-view></router-view>
            </div>
            <app-footer></app-footer>
        </div>
        <div class="layout-mask animate-fadein"></div>
    </div>
    <Toast />
</template>

<style scoped>
/* Government Enterprise Layout Styling */
.layout-wrapper {
    font-family: 'Inter', 'Roboto', system-ui, -apple-system, sans-serif;
}

.layout-main-container {
    background: #F8FAFC !important;
}

.layout-main {
    background: #F8FAFC !important;
    min-height: calc(100vh - 8rem);
}

/* Ensure all cards have government styling */
:deep(.card) {
    border-radius: 2px !important;
    border: 1px solid #E2E8F0 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

/* Global button styling */
:deep(.p-button:not(.p-button-outlined):not(.p-button-text)) {
    background-color: #1B365D !important;
    border-color: #1B365D !important;
    border-radius: 2px !important;
    font-weight: 600;
    letter-spacing: 0.025em;
}

:deep(.p-button:not(.p-button-outlined):not(.p-button-text):hover) {
    background-color: #2A4A7C !important;
    border-color: #2A4A7C !important;
}

:deep(.p-button-outlined) {
    border-color: #64748B !important;
    color: #64748B !important;
    border-radius: 2px !important;
}

:deep(.p-button-outlined:hover) {
    background-color: #F1F5F9 !important;
    color: #1B365D !important;
}

/* Reduce border radius globally */
:deep(.p-component) {
    border-radius: 2px !important;
}
</style>

<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';
import { onMounted, ref } from 'vue';

const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();


let userName = ref();

onMounted(() => {
    userName.value = localStorage.getItem('userName');
});

function logout() {
    localStorage.clear();
    window.location.href = '/login';

    console.log("##### logout #######")
}
</script>

<template>
    <div class="layout-topbar">
        <button class="layout-menu-button" @click="onMenuToggle">
            <i class="pi pi-bars"></i>
        </button>

        <router-link to="/" class="layout-topbar-logo">
            <img src="/coat_arms.png" alt="TRAB Logo" />
            <span>Tax Revenue Appeal Board</span>
        </router-link>

        <div class="layout-topbar-actions">
            <button type="button" class="layout-topbar-action" title="Profile">
                <i class="pi pi-user"></i>
                <span>Profile</span>
            </button>

            <button type="button" class="layout-topbar-action" @click="logout" title="Logout">
                <i class="pi pi-power-off"></i>
                <span>Logout</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
/* Government Enterprise Topbar Styling */
.layout-topbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 4rem;
    background: #1B365D;
    border-bottom: 2px solid #D4AF37;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    padding: 0 2rem;
    gap: 1rem;
    z-index: 1000;
}

/* Menu Toggle Button */
.layout-menu-button {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: #FFFFFF;
    cursor: pointer;
    transition: background-color 0.2s;
}

.layout-menu-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.layout-menu-button i {
    font-size: 1.25rem;
}

/* Logo Section */
.layout-topbar-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    margin-right: auto;
}

.layout-topbar-logo img {
    width: 48px;
    height: 36px;
    object-fit: contain;
}

.layout-topbar-logo span {
    color: #FFFFFF;
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: 0.25px;
    white-space: nowrap;
}

/* Actions Section */
.layout-topbar-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.layout-topbar-action {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: #FFFFFF;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
}

.layout-topbar-action:hover {
    background-color: rgba(255, 255, 255, 0.15);
}

.layout-topbar-action i {
    font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
    .layout-topbar {
        padding: 0 1rem;
    }

    .layout-topbar-logo span {
        font-size: 1rem;
    }

    .layout-topbar-action span {
        display: none;
    }

    .layout-topbar-action {
        padding: 0.5rem;
        width: 2.5rem;
        height: 2.5rem;
        justify-content: center;
    }
}
</style>

import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import AuthService from '@/service/AuthService';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // Default route redirects to search
        {
            path: '/',
            redirect: '/dashboard'
        },
        // Login route
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        // App layout and protected routes
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/search',
                    name: 'search',
                    component: () => import('@/views/SearchCases.vue')
                },
                {
                    path: '/case/:id',
                    name: 'CaseDetails',
                    component: () => import('@/views/CaseDetails.vue')
                },
                {
                    path: '/ocr',
                    name: 'ocr',
                    component: () => import('@/views/OcrManagement.vue')
                },
                {
                    path: '/sync',
                    name: 'sync',
                    component: () => import('@/views/SyncManagement.vue')
                },
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/defaults/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/defaults/Crud.vue')
                },
                {
                    path: '/pages/notices',
                    name: 'notices',
                    component: () => import('@/views/pages/appeals/Notices.vue')
                },
                {
                    path: '/pages/high',
                    name: 'courts',
                    component: () => import('@/views/pages/appeals/NoticeHighCourt.vue')
                },
                {
                    path: '/pages/summons',
                    name: 'summons',
                    component: () => import('@/views/pages/appeals/Summons.vue')
                },
                {
                    path: '/pages/applications',
                    name: 'applications',
                    component: () => import('@/views/pages/appeals/Applications.vue')
                },
                {
                    path: '/pages/statements',
                    name: 'statements',
                    component: () => import('@/views/pages/appeals/Statements.vue')
                },
                {
                    path: '/common-setup',
                    name: 'common-setup',
                    component: () => import('@/views/pages/settings/CommonSetup.vue')
                },
                {
                    path: '/judges',
                    name: 'judges',
                    component: () => import('@/views/pages/settings/Judge.vue')
                },
                {
                    path: '/parties',
                    name: 'parties',
                    component: () => import('@/views/pages/settings/Parties.vue')
                },
                {
                    path: '/fees',
                    name: 'fees',
                    component: () => import('@/views/pages/settings/Fees.vue')
                },
                {
                    path: '/bill',
                    name: 'bill',
                    component: () => import('@/views/pages/payment/Bill.vue')
                },
                {
                    path: '/payment',
                    name: 'payment',
                    component: () => import('@/views/pages/payment/Payment.vue')
                },
                {
                    path: '/user-management/users',
                    name: 'users',
                    component: () => import('@/views/pages/settings/UserManagement.vue')
                },
                {
                    path: '/user-management/roles',
                    name: 'roles',
                    component: () => import('@/views/pages/settings/RoleManagement.vue')
                },
                {
                    path: '/reports/appeal-reports',
                    name: 'appealReports',
                    component: () => import('@/views/pages/reports/AppealReports.vue')
                },
                {
                    path: '/reports/payment-reports',
                    name: 'paymentReports',
                    component: () => import('@/views/pages/reports/PaymentReports.vue')
                },
                {
                    path: '/reports/summons-reports',
                    name: 'Cause List',
                    component: () => import('@/views/pages/reports/SummonReports.vue')
                }
            ]
        },
        // Public pages
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/defaults/Landing.vue')
        },
        // Authentication-related pages
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },
        // Catch-all route for 404
        {
            path: '/:pathMatch(.*)*',
            name: 'notfound',
            component: () => import('@/views/pages/appeals/NotFound.vue')
        }
    ]
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const isAuthenticated = AuthService.isAuthenticated();

    if (requiresAuth && !isAuthenticated) {
        // Redirect to login if route requires auth and user is not authenticated
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        });
    } else if (to.path === '/login' && isAuthenticated) {
        // Redirect to dashboard if user is already authenticated and tries to access login
        next('/dashboard');
    } else {
        next();
    }
});

export default router;

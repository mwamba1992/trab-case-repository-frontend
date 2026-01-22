<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import AuthService from '@/service/AuthService';
import router from '@/router';

const email = ref('');
const password = ref('');
const checked = ref(false);
const loading = ref(false);
const toast = useToast();

async function handleSignIn() {
    // Validate input fields
    if (!email.value || !password.value) {
        toast.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: 'Please enter both email and password',
            life: 3000
        });
        return;
    }

    loading.value = true;

    try {
        const response = await AuthService.login(email.value, password.value);

        if (response.accessToken) {
            toast.add({
                severity: 'success',
                summary: 'Login Successful',
                detail: 'Welcome back!',
                life: 3000
            });

            // Redirect to the requested page or dashboard
            const redirect = router.currentRoute.value.query.redirect || '/dashboard';

            // Use window.location for hard navigation to avoid navigation guard conflicts
            setTimeout(() => {
                window.location.href = redirect;
            }, 500);
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        console.error('Login failed:', error);

        const errorMessage = error.response?.data?.message ||
                            error.response?.data?.error ||
                            'Invalid email or password';

        toast.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: errorMessage,
            life: 5000
        });
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <Toast />
    <div class="login-wrapper">
        <div class="login-container">
            <!-- Decorative Background Elements -->
            <div class="decorative-circle circle-1"></div>
            <div class="decorative-circle circle-2"></div>
            <div class="decorative-circle circle-3"></div>

            <!-- Login Card -->
            <div class="login-card">
                <!-- Header Section -->
                <div class="login-header">
                    <div class="logo-container">
                        <img src="/coat_arms.png" alt="Tanzania Coat of Arms" class="coat-arms-main">
                    </div>
                    <h1 class="main-title">Tax Revenue Appeals Board</h1>
                    <p class="main-subtitle">Case Repository & Decision Portal</p>
                    <div class="divider"></div>
                </div>

                <!-- Form Section -->
                <div class="login-body">
                    <div class="welcome-text">
                        <h2>Welcome Back</h2>
                        <p>Please enter your credentials to continue</p>
                    </div>

                    <div class="form-content">
                        <div class="input-group">
                            <label for="email">Email Address</label>
                            <div class="input-wrapper">
                                <i class="pi pi-user input-icon"></i>
                                <InputText
                                    id="email"
                                    v-model="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    :disabled="loading"
                                />
                            </div>
                        </div>

                        <div class="input-group">
                            <label for="password">Password</label>
                            <div class="input-wrapper password-wrapper">
                                <i class="pi pi-lock input-icon"></i>
                                <Password
                                    id="password"
                                    v-model="password"
                                    placeholder="Enter your password"
                                    :toggleMask="true"
                                    :feedback="false"
                                    :disabled="loading"
                                />
                            </div>
                        </div>

                        <div class="form-footer-options">
                            <div class="checkbox-wrapper">
                                <Checkbox v-model="checked" inputId="remember" :binary="true" />
                                <label for="remember">Remember me</label>
                            </div>
                            <a href="#" class="link-text">Forgot password?</a>
                        </div>

                        <Button
                            label="Sign In"
                            icon="pi pi-sign-in"
                            iconPos="right"
                            class="btn-signin"
                            @click="handleSignIn"
                            :loading="loading"
                        />
                    </div>
                </div>

                <!-- Footer Section -->
                <div class="login-footer">
                    <div class="footer-features">
                        <div class="feature-badge">
                            <i class="pi pi-shield"></i>
                            <span>Secure</span>
                        </div>
                        <div class="feature-badge">
                            <i class="pi pi-check-circle"></i>
                            <span>Trusted</span>
                        </div>
                        <div class="feature-badge">
                            <i class="pi pi-lock"></i>
                            <span>Encrypted</span>
                        </div>
                    </div>
                    <p class="footer-text">United Republic of Tanzania</p>
                    <p class="footer-motto">Integrity • Transparency • Justice</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Modern Government Login Page */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.login-wrapper {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f2642 0%, #1B365D 50%, #2A4A7C 100%);
    font-family: 'Inter', 'Segoe UI', 'Roboto', system-ui, sans-serif;
    position: relative;
    overflow: hidden;
    padding: 2rem;
}

.login-container {
    position: relative;
    width: 100%;
    max-width: 440px;
    z-index: 10;
}

/* Decorative Background Circles */
.decorative-circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;
    animation: float 20s infinite ease-in-out;
}

.circle-1 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, #D4AF37, #FFD700);
    top: -250px;
    right: -250px;
    animation-delay: 0s;
}

.circle-2 {
    width: 350px;
    height: 350px;
    background: linear-gradient(135deg, #FFFFFF, #E2E8F0);
    bottom: -175px;
    left: -175px;
    animation-delay: 7s;
}

.circle-3 {
    width: 250px;
    height: 250px;
    background: linear-gradient(135deg, #D4AF37, #FFD700);
    top: 50%;
    left: -125px;
    animation-delay: 14s;
}

@keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -30px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Login Card */
.login-card {
    background: #FFFFFF;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(212, 175, 55, 0.1);
    overflow: hidden;
    animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Header Section */
.login-header {
    background: linear-gradient(135deg, #1B365D 0%, #2A4A7C 100%);
    padding: 2rem 2rem 1.75rem;
    text-align: center;
    position: relative;
}

.logo-container {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.coat-arms-main {
    width: 80px;
    height: 80px;
    object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
    animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

.main-title {
    color: #FFFFFF;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.375rem;
    letter-spacing: 0.3px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    line-height: 1.3;
}

.main-subtitle {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    font-weight: 400;
    margin-bottom: 1.25rem;
}

.divider {
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #D4AF37, transparent);
    margin: 0 auto;
}

/* Body Section */
.login-body {
    padding: 2rem 2rem 1.75rem;
}

.welcome-text {
    text-align: center;
    margin-bottom: 1.75rem;
}

.welcome-text h2 {
    color: #1B365D;
    font-size: 1.375rem;
    font-weight: 700;
    margin-bottom: 0.375rem;
}

.welcome-text p {
    color: #64748B;
    font-size: 0.875rem;
}

.form-content {
    margin-top: 1.5rem;
}

/* Input Groups */
.input-group {
    margin-bottom: 1.25rem;
}

.input-group label {
    display: block;
    color: #0F2642;
    font-size: 0.8125rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.75px;
}

.input-wrapper {
    position: relative;
}

.input-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6B7280;
    font-size: 1.0rem;
    z-index: 1;
}

.input-wrapper :deep(input) {
    width: 100%;
    height: 3rem;
    padding: 0 1rem 0 3rem;
    border: 1px solid #D1D5DB;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.2s;
    background: #FFFFFF;
    font-family: 'Inter', 'Roboto', system-ui, sans-serif;
}

.input-wrapper :deep(input:hover) {
    border-color: #9CA3AF;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.input-wrapper :deep(input:focus) {
    border-color: #1B365D;
    border-width: 2px;
    padding: 0 calc(1rem - 1px) 0 calc(3rem - 1px);
    background: #FFFFFF;
    outline: none;
    box-shadow: 0 0 0 3px rgba(27, 54, 93, 0.12);
}

.input-wrapper :deep(input:disabled) {
    background: #F1F5F9;
    cursor: not-allowed;
    opacity: 0.7;
}

.password-wrapper :deep(.p-password) {
    width: 100%;
}

.password-wrapper :deep(.p-password-input) {
    width: 100%;
    height: 3rem;
    padding: 0 3.5rem 0 3rem;
    border: 1px solid #D1D5DB;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.2s;
    background: #FFFFFF;
    font-family: 'Inter', 'Roboto', system-ui, sans-serif;
}

.password-wrapper :deep(.p-password-input:hover) {
    border-color: #9CA3AF;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.password-wrapper :deep(.p-password-input:focus) {
    border-color: #1B365D;
    border-width: 2px;
    padding: 0 calc(3.5rem - 1px) 0 calc(3rem - 1px);
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(27, 54, 93, 0.12);
}

/* Form Footer Options */
.form-footer-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 1.25rem 0 1.5rem;
}

.checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.checkbox-wrapper label {
    color: #374151;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    text-transform: none;
    letter-spacing: normal;
}

.link-text {
    color: #1B365D;
    font-size: 0.875rem;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s;
}

.link-text:hover {
    color: #0F2642;
    text-decoration: underline;
}

/* Sign In Button */
.btn-signin {
    width: 100%;
    height: 3rem;
    background: linear-gradient(135deg, #1B365D 0%, #2A4A7C 100%);
    border: none;
    border-radius: 8px;
    color: #FFFFFF;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    box-shadow: 0 4px 12px rgba(27, 54, 93, 0.25);
    font-family: 'Inter', 'Roboto', system-ui, sans-serif;
}

.btn-signin:hover:not(:disabled) {
    background: linear-gradient(135deg, #0F2642 0%, #1B365D 100%);
    box-shadow: 0 8px 24px rgba(27, 54, 93, 0.45);
    transform: translateY(-3px);
}

.btn-signin:active:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(27, 54, 93, 0.35);
}

.btn-signin:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Footer Section */
.login-footer {
    background: #F8FAFC;
    padding: 1.5rem 2rem;
    text-align: center;
    border-top: 1px solid #E2E8F0;
}

.footer-features {
    display: flex;
    justify-content: center;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
}

.feature-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.feature-badge i {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1B365D, #2A4A7C);
    color: #D4AF37;
    border-radius: 50%;
    font-size: 0.875rem;
}

.feature-badge span {
    color: #64748B;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.footer-text {
    color: #1B365D;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.footer-motto {
    color: #64748B;
    font-size: 0.8rem;
    font-style: italic;
    letter-spacing: 1px;
}

/* Responsive Design */
@media (max-width: 640px) {
    .login-wrapper {
        padding: 1rem;
    }

    .login-header {
        padding: 2rem 1.5rem 1.5rem;
    }

    .main-title {
        font-size: 1.375rem;
    }

    .main-subtitle {
        font-size: 0.875rem;
    }

    .login-body {
        padding: 2rem 1.5rem 1.5rem;
    }

    .welcome-text h2 {
        font-size: 1.25rem;
    }

    .login-footer {
        padding: 1.5rem;
    }

    .footer-features {
        gap: 1rem;
    }

    .feature-badge i {
        width: 36px;
        height: 36px;
        font-size: 0.875rem;
    }
}
</style>

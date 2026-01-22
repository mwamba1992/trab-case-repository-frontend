<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import DashboardService from '@/service/DashboardService';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

const router = useRouter();

// Dashboard data
const dashboardStats = ref(null);
const casesByJudge = ref([]);
const casesByStatus = ref(null);
const casesByOutcome = ref(null);
const casesByType = ref(null);
const recentDecisions = ref([]);

// Chart data
const statusChartData = ref(null);
const outcomeChartData = ref(null);
const trendsChartData = ref(null);
const typeChartData = ref(null);

// Loading state
const loading = ref(true);

onMounted(async () => {
    await loadDashboardData();
});

async function loadDashboardData() {
    loading.value = true;
    try {
        // Fetch all dashboard data
        dashboardStats.value = await DashboardService.getDashboardStats();
        casesByJudge.value = await DashboardService.getCasesByJudge();
        casesByStatus.value = await DashboardService.getCasesByStatus();
        casesByOutcome.value = await DashboardService.getCasesByOutcome();
        casesByType.value = await DashboardService.getCasesByType();
        recentDecisions.value = await DashboardService.getRecentDecisions();

        // Setup charts
        setupStatusChart();
        setupOutcomeChart();
        setupTrendsChart();
        setupTypeChart();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    } finally {
        loading.value = false;
    }
}

function setupStatusChart() {
    statusChartData.value = {
        labels: ['Pending', 'Decided', 'Appealed', 'Withdrawn', 'Settled'],
        datasets: [
            {
                data: [
                    casesByStatus.value.pending,
                    casesByStatus.value.decided,
                    casesByStatus.value.appealed,
                    casesByStatus.value.withdrawn,
                    casesByStatus.value.settled
                ],
                backgroundColor: ['#F59E0B', '#10B981', '#6366F1', '#64748B', '#8B5CF6'],
                hoverBackgroundColor: ['#FBBF24', '#34D399', '#818CF8', '#94A3B8', '#A78BFA']
            }
        ]
    };
}

function setupOutcomeChart() {
    outcomeChartData.value = {
        labels: ['Allowed', 'Dismissed', 'Partially Allowed', 'Remanded'],
        datasets: [
            {
                label: 'Number of Cases',
                data: [
                    casesByOutcome.value.allowed,
                    casesByOutcome.value.dismissed,
                    casesByOutcome.value.partially_allowed,
                    casesByOutcome.value.remanded
                ],
                backgroundColor: '#1B365D',
                borderColor: '#1B365D',
                borderWidth: 1,
                barThickness: 80,
                maxBarThickness: 100,
                borderRadius: 2
            }
        ]
    };
}

function setupTrendsChart() {
    trendsChartData.value = {
        labels: dashboardStats.value.monthlyTrends.labels,
        datasets: [
            {
                label: 'Filed',
                data: dashboardStats.value.monthlyTrends.filed,
                borderColor: '#1B365D',
                backgroundColor: 'rgba(27, 54, 93, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Decided',
                data: dashboardStats.value.monthlyTrends.decided,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Pending',
                data: dashboardStats.value.monthlyTrends.pending,
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };
}

function setupTypeChart() {
    const types = Object.keys(casesByType.value);
    const values = Object.values(casesByType.value);

    typeChartData.value = {
        labels: types,
        datasets: [
            {
                data: values,
                backgroundColor: ['#1B365D', '#2A4A7C', '#3B5F9E', '#4C74B7', '#5D89D0'],
                hoverBackgroundColor: ['#2A4A7C', '#3B5F9E', '#4C74B7', '#5D89D0', '#6E9EE9']
            }
        ]
    };
}

const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#1B365D',
                font: {
                    size: 13,
                    weight: 600
                },
                padding: 10,
                boxWidth: 16
            }
        }
    }
};

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: {
                color: '#1B365D',
                font: {
                    size: 13,
                    weight: 600
                },
                padding: 8,
                boxWidth: 15
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: '#64748B',
                font: {
                    size: 12
                }
            },
            grid: {
                color: '#E2E8F0'
            }
        },
        x: {
            ticks: {
                color: '#64748B',
                font: {
                    size: 11,
                    weight: 600
                }
            },
            grid: {
                display: false
            }
        }
    }
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-TZ', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0
    }).format(value);
};

const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
};

const getOutcomeSeverity = (outcome) => {
    const severityMap = {
        allowed: 'success',
        dismissed: 'danger',
        partially_allowed: 'warn',
        remanded: 'info'
    };
    return severityMap[outcome] || 'info';
};

const viewCaseDetails = (caseId) => {
    router.push({ name: 'CaseDetails', params: { id: caseId } });
};
</script>

<template>
    <div class="dashboard-container">
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">TRAB Case Repository Dashboard</h1>
            <p class="text-gray-600 mt-2">Overview of case statistics and performance metrics</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
            <i class="pi pi-spin pi-spinner text-4xl text-gray-400"></i>
            <p class="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>

        <!-- Dashboard Content -->
        <div v-else>
            <!-- Top Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <!-- Total Cases -->
                <div class="stat-card">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="stat-label">Total Cases</p>
                            <h3 class="stat-value">{{ dashboardStats.totalCases.toLocaleString() }}</h3>
                        </div>
                        <div class="stat-icon bg-blue-100">
                            <i class="pi pi-folder text-blue-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Allowed Cases -->
                <div class="stat-card">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="stat-label">Allowed Cases</p>
                            <h3 class="stat-value">{{ dashboardStats.allowedCases.toLocaleString() }}</h3>
                        </div>
                        <div class="stat-icon bg-green-100">
                            <i class="pi pi-check-circle text-green-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Dismissed Cases -->
                <div class="stat-card">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="stat-label">Dismissed Cases</p>
                            <h3 class="stat-value">{{ dashboardStats.dismissedCases.toLocaleString() }}</h3>
                        </div>
                        <div class="stat-icon bg-red-100">
                            <i class="pi pi-times-circle text-red-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Avg Resolution Days -->
                <div class="stat-card">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="stat-label">Avg Resolution</p>
                            <h3 class="stat-value">{{ dashboardStats.averageResolutionDays }} <span class="text-base text-gray-500">days</span></h3>
                        </div>
                        <div class="stat-icon bg-purple-100">
                            <i class="pi pi-calendar text-purple-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Row 1 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Cases by Status -->
                <div class="card">
                    <h3 class="card-title mb-4">Cases by Status</h3>
                    <div style="height: 320px; width: 100%;">
                        <Chart type="pie" :data="statusChartData" :options="pieChartOptions" />
                    </div>
                </div>

                <!-- Cases by Outcome -->
                <div class="card" style="min-height: 400px;">
                    <h3 class="card-title mb-4">Cases by Outcome</h3>
                    <div style="height: 320px; width: 100%; position: relative;">
                        <Chart type="bar" :data="outcomeChartData" :options="barChartOptions" />
                    </div>
                </div>
            </div>

            <!-- Charts Row 2 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Cases by Type -->
                <div class="card">
                    <h3 class="card-title mb-4">Cases by Tax Type</h3>
                    <div style="height: 320px; width: 100%;">
                        <Chart type="doughnut" :data="typeChartData" :options="pieChartOptions" />
                    </div>
                </div>

                <!-- Monthly Trends -->
                <div class="card" style="min-height: 400px;">
                    <h3 class="card-title mb-4">Monthly Case Trends (2024)</h3>
                    <div style="height: 320px; width: 100%; position: relative;">
                        <Chart type="line" :data="trendsChartData" :options="barChartOptions" />
                    </div>
                </div>
            </div>

            <!-- Cases by Judge Table -->
            <div class="card mb-6">
                <h3 class="card-title mb-4">Cases by Chairperson</h3>
                <DataTable :value="casesByJudge" :paginator="true" :rows="5" stripedRows>
                    <Column field="chairperson" header="Chairperson" :sortable="true" style="min-width: 200px;"></Column>
                    <Column field="totalCases" header="Total" :sortable="true">
                        <template #body="slotProps">
                            <span class="font-semibold">{{ slotProps.data.totalCases }}</span>
                        </template>
                    </Column>
                    <Column field="allowed" header="Allowed" :sortable="true">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.allowed" severity="success"></Tag>
                        </template>
                    </Column>
                    <Column field="dismissed" header="Dismissed" :sortable="true">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.dismissed" severity="danger"></Tag>
                        </template>
                    </Column>
                    <Column field="partiallyAllowed" header="Partial" :sortable="true">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.partiallyAllowed" severity="warn"></Tag>
                        </template>
                    </Column>
                    <Column field="avgResolutionDays" header="Avg Days" :sortable="true">
                        <template #body="slotProps">
                            {{ slotProps.data.avgResolutionDays }} days
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- Recent Decisions -->
            <div class="card">
                <h3 class="card-title mb-4">Recent Decisions</h3>
                <DataTable :value="recentDecisions" stripedRows>
                    <Column field="caseNumber" header="Case Number" :sortable="true" style="min-width: 180px;"></Column>
                    <Column field="appellant" header="Appellant" :sortable="true" style="min-width: 200px;"></Column>
                    <Column field="outcome" header="Outcome" :sortable="true">
                        <template #body="slotProps">
                            <Tag
                                :value="slotProps.data.outcome.replace('_', ' ').toUpperCase()"
                                :severity="getOutcomeSeverity(slotProps.data.outcome)"
                            ></Tag>
                        </template>
                    </Column>
                    <Column field="taxAmount" header="Tax Amount" :sortable="true">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.taxAmount) }}
                        </template>
                    </Column>
                    <Column field="decisionDate" header="Decision Date" :sortable="true"></Column>
                    <Column field="chairperson" header="Chairperson" style="min-width: 200px;"></Column>
                    <Column header="Actions" style="width: 100px;">
                        <template #body="slotProps">
                            <Button
                                icon="pi pi-eye"
                                severity="info"
                                text
                                rounded
                                @click="viewCaseDetails(slotProps.data.id)"
                                v-tooltip.top="'View Case Details'"
                            />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Government Enterprise Dashboard Styling */
.dashboard-container {
    padding: 1.5rem;
    font-family: 'Inter', 'Roboto', system-ui, sans-serif;
}

/* Stat Cards */
.stat-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
}

.stat-card:hover {
    box-shadow: 0 4px 6px rgba(27, 54, 93, 0.1);
    transform: translateY(-2px);
}

.stat-label {
    color: #64748B;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    margin-bottom: 0.5rem;
}

.stat-value {
    color: #1B365D;
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
}

.stat-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Cards */
.card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-title {
    color: #1B365D;
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

/* Force charts to fill container */
:deep(.p-chart) {
    height: 100% !important;
}

:deep(.p-chart canvas) {
    height: 100% !important;
    max-height: 100% !important;
}

/* DataTable Styling */
:deep(.p-datatable) {
    border-radius: 4px;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: #F8FAFC;
    color: #1B365D;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    border-color: #E2E8F0;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
    border-color: #E2E8F0;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: #F8FAFC;
}

:deep(.p-datatable .p-datatable-tbody > tr.p-row-odd) {
    background-color: #FAFBFC;
}

/* Headings */
h1 {
    color: #1B365D;
}

h2, h3, h4 {
    color: #1B365D;
}

/* Loading State */
.pi-spinner {
    color: #1B365D;
}

/* Action Buttons */
:deep(.p-button.p-button-text.p-button-rounded) {
    transition: all 0.2s;
}

:deep(.p-button.p-button-text.p-button-rounded:hover) {
    background-color: rgba(27, 54, 93, 0.1) !important;
}

:deep(.p-button.p-button-text.p-button-info) {
    color: #1B365D !important;
}

:deep(.p-button.p-button-text.p-button-info:hover) {
    color: #2A4A7C !important;
}

/* Center action buttons */
:deep(.p-datatable .p-datatable-tbody > tr > td:last-child) {
    text-align: center;
}
</style>

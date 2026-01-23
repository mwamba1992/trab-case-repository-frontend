<template>
    <div class="analytics-dashboard">
        <Toast />

        <!-- Header -->
        <div class="dashboard-header mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Advanced Analytics Dashboard</h1>
                <p class="text-gray-600 mt-2">Comprehensive insights and performance metrics</p>
            </div>
            <div class="header-actions">
                <Button
                    icon="pi pi-refresh"
                    label="Refresh Data"
                    @click="loadAllData"
                    :loading="loading"
                    outlined
                />
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
            <p class="loading-text">Loading analytics data...</p>
        </div>

        <!-- Main Content -->
        <div v-else>
            <!-- Overview Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <!-- Total Cases -->
                <div class="stat-card" v-tooltip.top="'Total cases in the repository'">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="stat-label">Total Cases</p>
                            <h3 class="stat-value">{{ overview.totalCases?.toLocaleString() || 0 }}</h3>
                            <p class="stat-trend">
                                <i class="pi pi-chart-line"></i>
                                Complete repository
                            </p>
                        </div>
                        <div class="stat-icon bg-blue-100">
                            <i class="pi pi-folder text-blue-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Decided Cases -->
                <div class="stat-card stat-card-success" v-tooltip.top="`${((overview.decidedCases / overview.totalCases) * 100).toFixed(1)}% of cases decided`">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="stat-label">Decided Cases</p>
                            <h3 class="stat-value">{{ overview.decidedCases?.toLocaleString() || 0 }}</h3>
                            <p class="stat-trend text-green-600">
                                <i class="pi pi-check-circle"></i>
                                {{ ((overview.decidedCases / overview.totalCases) * 100).toFixed(1) }}% decided
                            </p>
                        </div>
                        <div class="stat-icon bg-green-100">
                            <i class="pi pi-check-circle text-green-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Total Tax Disputed -->
                <div class="stat-card stat-card-warning" v-tooltip.top="'Total tax amount under dispute'">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="stat-label">Tax Disputed</p>
                            <h3 class="stat-value text-lg">{{ formatLargeCurrency(overview.totalTaxDisputed) }}</h3>
                            <p class="stat-trend text-orange-600">
                                <i class="pi pi-money-bill"></i>
                                In dispute
                            </p>
                        </div>
                        <div class="stat-icon bg-orange-100">
                            <i class="pi pi-money-bill text-orange-600 text-2xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Avg Decision Time -->
                <div class="stat-card" v-tooltip.top="'Average days from filing to decision'">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="stat-label">Avg Decision Time</p>
                            <h3 class="stat-value">{{ Math.round(overview.averageDecisionDays || 0) }} <span class="text-base text-gray-500">days</span></h3>
                            <p class="stat-trend text-purple-600">
                                <i class="pi pi-clock"></i>
                                ~{{ Math.round((overview.averageDecisionDays || 0) / 30) }} months
                            </p>
                        </div>
                        <div class="stat-icon bg-purple-100">
                            <i class="pi pi-calendar text-purple-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Row 1: Outcome & Trends -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Outcome Distribution -->
                <Card class="chart-card">
                    <template #title>
                        <div class="card-title">
                            <i class="pi pi-chart-pie"></i>
                            <span>Outcome Distribution</span>
                        </div>
                    </template>
                    <template #content>
                        <div style="height: 320px; width: 100%;">
                            <Chart type="doughnut" :data="outcomeChartData" :options="doughnutChartOptions" />
                        </div>
                    </template>
                </Card>

                <!-- Monthly Trends -->
                <Card class="chart-card">
                    <template #title>
                        <div class="card-title">
                            <i class="pi pi-chart-line"></i>
                            <span>Case Trends Over Time</span>
                        </div>
                    </template>
                    <template #content>
                        <div style="height: 320px; width: 100%;">
                            <Chart type="line" :data="trendsChartData" :options="lineChartOptions" />
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Charts Row 2: Tax Types & Chairperson Performance -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Tax Type Success Rates -->
                <Card class="chart-card">
                    <template #title>
                        <div class="card-title">
                            <i class="pi pi-percentage"></i>
                            <span>Success Rate by Tax Type</span>
                        </div>
                    </template>
                    <template #content>
                        <div style="height: 320px; width: 100%;">
                            <Chart type="bar" :data="taxTypeChartData" :options="barChartOptions" />
                        </div>
                    </template>
                </Card>

                <!-- Chairperson Performance -->
                <Card class="chart-card">
                    <template #title>
                        <div class="card-title">
                            <i class="pi pi-users"></i>
                            <span>Chairperson Performance</span>
                        </div>
                    </template>
                    <template #content>
                        <div style="height: 320px; width: 100%;">
                            <Chart type="bar" :data="chairpersonChartData" :options="horizontalBarOptions" />
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Top Appellants Table -->
            <Card class="mb-6">
                <template #title>
                    <div class="card-title">
                        <i class="pi pi-building"></i>
                        <span>Top Appellants</span>
                    </div>
                </template>
                <template #content>
                    <DataTable :value="topAppellants" :paginator="true" :rows="10" stripedRows>
                        <Column field="appellant" header="Appellant" :sortable="true" style="min-width: 250px;"></Column>
                        <Column field="caseCount" header="Total Cases" :sortable="true">
                            <template #body="slotProps">
                                <span class="font-semibold">{{ slotProps.data.caseCount }}</span>
                            </template>
                        </Column>
                        <Column field="wonCases" header="Won" :sortable="true">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.wonCases" severity="success"></Tag>
                            </template>
                        </Column>
                        <Column field="lostCases" header="Lost" :sortable="true">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.lostCases" severity="danger"></Tag>
                            </template>
                        </Column>
                        <Column field="winRate" header="Win Rate" :sortable="true">
                            <template #body="slotProps">
                                <div class="flex items-center gap-2">
                                    <span class="font-bold">{{ slotProps.data.winRate.toFixed(1) }}%</span>
                                    <div class="progress-bar">
                                        <div class="progress-fill" :style="{ width: slotProps.data.winRate + '%', backgroundColor: getWinRateColor(slotProps.data.winRate) }"></div>
                                    </div>
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>

            <!-- Chairperson Details Table -->
            <Card>
                <template #title>
                    <div class="card-title">
                        <i class="pi pi-shield"></i>
                        <span>Chairperson Detailed Statistics</span>
                    </div>
                </template>
                <template #content>
                    <DataTable :value="chairpersonStats" :paginator="true" :rows="10" stripedRows>
                        <Column field="chairperson" header="Chairperson" :sortable="true" style="min-width: 200px;"></Column>
                        <Column field="totalCases" header="Total Cases" :sortable="true">
                            <template #body="slotProps">
                                <span class="font-semibold">{{ slotProps.data.totalCases }}</span>
                            </template>
                        </Column>
                        <Column field="decided" header="Decided" :sortable="true">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.decided" severity="success"></Tag>
                            </template>
                        </Column>
                        <Column field="pending" header="Pending" :sortable="true">
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.pending" severity="warn"></Tag>
                            </template>
                        </Column>
                        <Column field="allowedRate" header="Allowed Rate" :sortable="true">
                            <template #body="slotProps">
                                <span class="text-green-600 font-bold">{{ slotProps.data.allowedRate.toFixed(1) }}%</span>
                            </template>
                        </Column>
                        <Column field="dismissedRate" header="Dismissed Rate" :sortable="true">
                            <template #body="slotProps">
                                <span class="text-red-600 font-bold">{{ slotProps.data.dismissedRate.toFixed(1) }}%</span>
                            </template>
                        </Column>
                        <Column field="avgDaysToDecision" header="Avg Days" :sortable="true">
                            <template #body="slotProps">
                                {{ Math.round(slotProps.data.avgDaysToDecision) }} days
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Toast from 'primevue/toast';
import AnalyticsService from '@/service/AnalyticsService';

const toast = useToast();
const loading = ref(true);

// Data
const overview = ref({});
const chairpersonStats = ref([]);
const taxTypeStats = ref([]);
const trends = ref([]);
const outcomes = ref([]);
const topAppellants = ref([]);

// Chart data
const outcomeChartData = ref(null);
const trendsChartData = ref(null);
const taxTypeChartData = ref(null);
const chairpersonChartData = ref(null);

// Chart options
const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#1B365D',
                font: { size: 13, weight: 600 },
                padding: 10
            }
        },
        tooltip: {
            backgroundColor: 'rgba(27, 54, 93, 0.95)',
            titleColor: '#D4AF37',
            bodyColor: '#FFFFFF',
            borderColor: '#D4AF37',
            borderWidth: 1,
            padding: 12,
            callbacks: {
                label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const percentage = context.dataset.data.reduce((a, b) => a + b, 0);
                    const pct = ((value / percentage) * 100).toFixed(1);
                    return ` ${label}: ${value} (${pct}%)`;
                }
            }
        }
    }
};

const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                color: '#1B365D',
                font: { size: 12, weight: 600 },
                padding: 8
            }
        },
        tooltip: {
            backgroundColor: 'rgba(27, 54, 93, 0.95)',
            titleColor: '#D4AF37',
            bodyColor: '#FFFFFF',
            borderColor: '#D4AF37',
            borderWidth: 1,
            padding: 12
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { color: '#64748B', font: { size: 11 } },
            grid: { color: '#E2E8F0' }
        },
        x: {
            ticks: { color: '#64748B', font: { size: 10, weight: 600 } },
            grid: { display: false }
        }
    }
};

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(27, 54, 93, 0.95)',
            titleColor: '#D4AF37',
            bodyColor: '#FFFFFF',
            borderColor: '#D4AF37',
            borderWidth: 1,
            padding: 12,
            callbacks: {
                label: function(context) {
                    return ` Success Rate: ${context.parsed.y.toFixed(1)}%`;
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
            ticks: {
                color: '#64748B',
                font: { size: 11 },
                callback: function(value) {
                    return value + '%';
                }
            },
            grid: { color: '#E2E8F0' }
        },
        x: {
            ticks: { color: '#64748B', font: { size: 11, weight: 600 } },
            grid: { display: false }
        }
    }
};

const horizontalBarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                color: '#1B365D',
                font: { size: 11, weight: 600 },
                padding: 6
            }
        },
        tooltip: {
            backgroundColor: 'rgba(27, 54, 93, 0.95)',
            titleColor: '#D4AF37',
            bodyColor: '#FFFFFF',
            borderColor: '#D4AF37',
            borderWidth: 1,
            padding: 10
        }
    },
    scales: {
        x: {
            beginAtZero: true,
            ticks: { color: '#64748B', font: { size: 10 } },
            grid: { color: '#E2E8F0' }
        },
        y: {
            ticks: { color: '#64748B', font: { size: 10, weight: 600 } },
            grid: { display: false }
        }
    }
};

async function loadAllData() {
    loading.value = true;
    try {
        // Load all data in parallel
        const [overviewData, chairpersonData, taxTypeData, trendsData, outcomesData, appellantsData] = await Promise.all([
            AnalyticsService.getDashboardOverview(),
            AnalyticsService.getChairpersonStats(),
            AnalyticsService.getTaxTypeStats(),
            AnalyticsService.getTrends(),
            AnalyticsService.getOutcomeDistribution(),
            AnalyticsService.getTopAppellants()
        ]);

        overview.value = overviewData.overview;
        chairpersonStats.value = chairpersonData;
        taxTypeStats.value = taxTypeData;
        trends.value = trendsData;
        outcomes.value = outcomesData;
        topAppellants.value = appellantsData;

        setupCharts();
    } catch (error) {
        console.error('Error loading analytics data:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load analytics data',
            life: 5000
        });
    } finally {
        loading.value = false;
    }
}

function setupCharts() {
    // Outcome Distribution Chart
    outcomeChartData.value = {
        labels: outcomes.value.map(o => o.outcome.charAt(0).toUpperCase() + o.outcome.slice(1)),
        datasets: [{
            data: outcomes.value.map(o => o.count),
            backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#6366F1'],
            hoverBackgroundColor: ['#34D399', '#F87171', '#FBBF24', '#818CF8']
        }]
    };

    // Trends Chart
    trendsChartData.value = {
        labels: trends.value.map(t => t.period),
        datasets: [
            {
                label: 'Total Cases',
                data: trends.value.map(t => t.totalCases),
                borderColor: '#1B365D',
                backgroundColor: 'rgba(27, 54, 93, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Decided',
                data: trends.value.map(t => t.decided),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Pending',
                data: trends.value.map(t => t.pending),
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    // Tax Type Success Rate Chart
    taxTypeChartData.value = {
        labels: taxTypeStats.value.map(t => t.taxType.replace('_', ' ').toUpperCase()),
        datasets: [{
            label: 'Success Rate',
            data: taxTypeStats.value.map(t => t.successRate),
            backgroundColor: '#1B365D',
            borderColor: '#1B365D',
            borderWidth: 1,
            borderRadius: 4
        }]
    };

    // Chairperson Performance Chart
    chairpersonChartData.value = {
        labels: chairpersonStats.value.map(c => c.chairperson),
        datasets: [
            {
                label: 'Decided',
                data: chairpersonStats.value.map(c => c.decided),
                backgroundColor: '#10B981',
                borderWidth: 0
            },
            {
                label: 'Dismissed',
                data: chairpersonStats.value.map(c => c.dismissed),
                backgroundColor: '#EF4444',
                borderWidth: 0
            },
            {
                label: 'Pending',
                data: chairpersonStats.value.map(c => c.pending),
                backgroundColor: '#F59E0B',
                borderWidth: 0
            }
        ]
    };
}

function formatLargeCurrency(amount) {
    return AnalyticsService.formatLargeCurrency(amount);
}

function getWinRateColor(rate) {
    if (rate >= 75) return '#10B981';
    if (rate >= 50) return '#F59E0B';
    return '#EF4444';
}

onMounted(() => {
    loadAllData();
});
</script>

<style scoped>
.analytics-dashboard {
    padding: 1.5rem;
    font-family: 'Inter', 'Roboto', system-ui, sans-serif;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

/* Loading State */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
}

.loading-text {
    margin-top: 1.5rem;
    font-size: 1rem;
    color: #64748B;
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

.stat-card-success {
    border-left: 4px solid #10B981;
}

.stat-card-warning {
    border-left: 4px solid #F59E0B;
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

.stat-trend {
    color: #64748B;
    font-size: 0.8rem;
    font-weight: 500;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.stat-trend i {
    font-size: 0.75rem;
}

.stat-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Charts */
.chart-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-title {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 1rem;
    font-weight: 700;
    color: #1B365D;
}

.card-title i {
    color: #D4AF37;
    font-size: 1.125rem;
}

/* Progress Bar */
.progress-bar {
    flex: 1;
    height: 8px;
    background: #E2E8F0;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 4px;
}

/* DataTable */
:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: #F8FAFC;
    color: #1B365D;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    border-color: #E2E8F0;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: #F8FAFC;
}
</style>

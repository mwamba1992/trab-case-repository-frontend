<template>
    <div class="ocr-management">
        <div class="card mb-4">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold">OCR Processing Management</h2>
                <Button
                    label="Process All Pending"
                    icon="pi pi-play"
                    @click="processAllPending"
                    :loading="processingAll"
                    severity="success"
                />
            </div>

            <!-- Queue Statistics -->
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div class="stat-card p-4 bg-blue-50 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Waiting</p>
                            <p class="text-3xl font-bold">{{ queueStats.waiting || 0 }}</p>
                        </div>
                        <i class="pi pi-clock text-4xl text-blue-500"></i>
                    </div>
                </div>
                <div class="stat-card p-4 bg-yellow-50 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Active</p>
                            <p class="text-3xl font-bold">{{ queueStats.active || 0 }}</p>
                        </div>
                        <i class="pi pi-spin pi-spinner text-4xl text-yellow-500"></i>
                    </div>
                </div>
                <div class="stat-card p-4 bg-green-50 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Completed</p>
                            <p class="text-3xl font-bold">{{ queueStats.completed || 0 }}</p>
                        </div>
                        <i class="pi pi-check-circle text-4xl text-green-500"></i>
                    </div>
                </div>
                <div class="stat-card p-4 bg-red-50 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Failed</p>
                            <p class="text-3xl font-bold">{{ queueStats.failed || 0 }}</p>
                        </div>
                        <i class="pi pi-times-circle text-4xl text-red-500"></i>
                    </div>
                </div>
                <div class="stat-card p-4 bg-purple-50 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600">Total</p>
                            <p class="text-3xl font-bold">{{ queueStats.total || 0 }}</p>
                        </div>
                        <i class="pi pi-database text-4xl text-purple-500"></i>
                    </div>
                </div>
            </div>

            <!-- Document Statistics -->
            <div class="mb-6">
                <h3 class="text-xl font-semibold mb-4">Document Processing Statistics</h3>
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div class="p-4 border rounded-lg">
                        <p class="text-sm text-gray-600">Total Documents</p>
                        <p class="text-2xl font-bold">{{ documentStats.total || 0 }}</p>
                    </div>
                    <div class="p-4 border rounded-lg">
                        <p class="text-sm text-gray-600">Pending</p>
                        <p class="text-2xl font-bold text-blue-600">{{ documentStats.pending || 0 }}</p>
                    </div>
                    <div class="p-4 border rounded-lg">
                        <p class="text-sm text-gray-600">Processing</p>
                        <p class="text-2xl font-bold text-yellow-600">{{ documentStats.processing || 0 }}</p>
                    </div>
                    <div class="p-4 border rounded-lg">
                        <p class="text-sm text-gray-600">Completed</p>
                        <p class="text-2xl font-bold text-green-600">{{ documentStats.completed || 0 }}</p>
                    </div>
                    <div class="p-4 border rounded-lg">
                        <p class="text-sm text-gray-600">Failed/Review</p>
                        <p class="text-2xl font-bold text-red-600">{{ (documentStats.failed || 0) + (documentStats.manualReview || 0) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Jobs -->
        <div class="card">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">Recent OCR Jobs</h3>
                <Button
                    label="Refresh"
                    icon="pi pi-refresh"
                    @click="loadData"
                    :loading="loading"
                    size="small"
                    outlined
                />
            </div>

            <DataTable
                :value="recentJobs"
                :loading="loading"
                :rows="10"
                :paginator="true"
                responsiveLayout="scroll"
                stripedRows
            >
                <Column field="fileName" header="File Name" :sortable="true" />
                <Column field="status" header="Status" :sortable="true">
                    <template #body="slotProps">
                        <Tag
                            :value="slotProps.data.status"
                            :severity="getJobStatusSeverity(slotProps.data.status)"
                        />
                    </template>
                </Column>
                <Column field="progress" header="Progress" :sortable="true">
                    <template #body="slotProps">
                        <div class="flex items-center gap-2">
                            <ProgressBar
                                :value="slotProps.data.progress"
                                :showValue="false"
                                class="flex-1"
                                :style="{ height: '8px' }"
                            />
                            <span class="text-sm">{{ slotProps.data.progress }}%</span>
                        </div>
                    </template>
                </Column>
                <Column field="createdAt" header="Created" :sortable="true">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.createdAt) }}
                    </template>
                </Column>
                <Column field="completedAt" header="Completed" :sortable="true">
                    <template #body="slotProps">
                        {{ slotProps.data.completedAt ? formatDate(slotProps.data.completedAt) : '-' }}
                    </template>
                </Column>
                <Column header="Actions">
                    <template #body="slotProps">
                        <div class="flex gap-2">
                            <Button
                                icon="pi pi-eye"
                                size="small"
                                outlined
                                @click="viewJobDetails(slotProps.data)"
                                v-tooltip.top="'View Details'"
                            />
                            <Button
                                v-if="slotProps.data.status === 'failed'"
                                icon="pi pi-replay"
                                size="small"
                                severity="danger"
                                outlined
                                @click="reprocessDocument(slotProps.data.documentId)"
                                v-tooltip.top="'Reprocess'"
                            />
                        </div>
                    </template>
                </Column>
                <Column field="result.processedPages" header="Pages" :sortable="true">
                    <template #body="slotProps">
                        <span v-if="slotProps.data.result">
                            {{ slotProps.data.result.processedPages }}/{{ slotProps.data.result.totalPages }}
                        </span>
                        <span v-else>-</span>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Job Details Dialog -->
        <Dialog v-model:visible="showJobDialog" header="Job Details" :modal="true" :style="{ width: '50vw' }">
            <div v-if="selectedJob">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="font-semibold">Job ID:</p>
                        <p class="text-sm">{{ selectedJob.id }}</p>
                    </div>
                    <div>
                        <p class="font-semibold">File Name:</p>
                        <p class="text-sm">{{ selectedJob.fileName }}</p>
                    </div>
                    <div>
                        <p class="font-semibold">Status:</p>
                        <Tag :value="selectedJob.status" :severity="getJobStatusSeverity(selectedJob.status)" />
                    </div>
                    <div>
                        <p class="font-semibold">Progress:</p>
                        <p>{{ selectedJob.progress }}%</p>
                    </div>
                    <div>
                        <p class="font-semibold">Created:</p>
                        <p class="text-sm">{{ formatDate(selectedJob.createdAt) }}</p>
                    </div>
                    <div v-if="selectedJob.completedAt">
                        <p class="font-semibold">Completed:</p>
                        <p class="text-sm">{{ formatDate(selectedJob.completedAt) }}</p>
                    </div>
                    <div v-if="selectedJob.result" class="col-span-2">
                        <p class="font-semibold">Result:</p>
                        <div class="mt-2 p-3 bg-gray-50 rounded">
                            <p>Total Pages: {{ selectedJob.result.totalPages }}</p>
                            <p>Processed: {{ selectedJob.result.processedPages }}</p>
                            <p>Failed: {{ selectedJob.result.failedPages }}</p>
                            <p>Avg Confidence: {{ (selectedJob.result.avgConfidence * 100).toFixed(2) }}%</p>
                        </div>
                    </div>
                    <div v-if="selectedJob.error" class="col-span-2">
                        <p class="font-semibold text-red-600">Error:</p>
                        <p class="text-sm text-red-500">{{ selectedJob.error }}</p>
                    </div>
                </div>
            </div>
        </Dialog>

        <!-- Toast for notifications -->
        <Toast />
    </div>
</template>

<script>
import OcrService from '@/service/OcrService';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';

export default {
    name: 'OcrManagement',
    components: {
        Button,
        DataTable,
        Column,
        Tag,
        ProgressBar,
        Dialog,
        Toast
    },
    data() {
        return {
            queueStats: {},
            documentStats: {},
            recentJobs: [],
            loading: false,
            processingAll: false,
            showJobDialog: false,
            selectedJob: null,
            autoRefreshInterval: null
        };
    },
    mounted() {
        this.loadData();
        // Auto-refresh every 5 seconds
        this.autoRefreshInterval = setInterval(() => {
            this.loadData(true);
        }, 5000);
    },
    beforeUnmount() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
    },
    methods: {
        async loadData(silent = false) {
            if (!silent) this.loading = true;
            try {
                const [stats, docStats, jobs] = await Promise.all([
                    OcrService.getQueueStats(),
                    OcrService.getDocumentStats(),
                    OcrService.getRecentJobs()
                ]);
                this.queueStats = stats;
                this.documentStats = docStats;
                this.recentJobs = jobs.jobs || [];
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load OCR data',
                    life: 3000
                });
            } finally {
                if (!silent) this.loading = false;
            }
        },
        async processAllPending() {
            this.processingAll = true;
            try {
                const result = await OcrService.processPendingDocuments();
                this.$toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Queued ${result.queued} documents for processing`,
                    life: 3000
                });
                this.loadData();
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message || 'Failed to process documents',
                    life: 3000
                });
            } finally {
                this.processingAll = false;
            }
        },
        async reprocessDocument(documentId) {
            try {
                await OcrService.reprocessDocument(documentId);
                this.$toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Document queued for reprocessing',
                    life: 3000
                });
                this.loadData();
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message || 'Failed to reprocess document',
                    life: 3000
                });
            }
        },
        viewJobDetails(job) {
            this.selectedJob = job;
            this.showJobDialog = true;
        },
        getJobStatusSeverity(status) {
            const severityMap = {
                'waiting': 'info',
                'active': 'warn',
                'completed': 'success',
                'failed': 'danger'
            };
            return severityMap[status] || 'info';
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleString();
        }
    }
};
</script>

<style scoped>
.ocr-management {
    padding: 1rem;
}

.stat-card {
    transition: all 0.3s;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>

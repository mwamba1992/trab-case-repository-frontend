<template>
    <div class="sync-management">
        <div class="card">
            <h2 class="text-3xl font-bold mb-6">TRAIS Sync Management</h2>

            <div class="mb-6 p-4 bg-blue-50 rounded-lg">
                <div class="flex items-start gap-3">
                    <i class="pi pi-info-circle text-2xl text-blue-500"></i>
                    <div>
                        <p class="font-semibold mb-2">About TRAIS Sync</p>
                        <p class="text-sm">
                            Sync case metadata and documents from the TRAIS (Tax Revenue Appeals Information System) API.
                            PDFs are processed from the local directory: <code class="bg-white px-2 py-1 rounded">/Users/mwendavano/trab/files/</code>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Sync Single Appeal -->
            <div class="sync-form mb-6">
                <h3 class="text-xl font-semibold mb-4">Sync Specific Appeal</h3>
                <div class="flex gap-3 items-end">
                    <div class="flex-1">
                        <label class="block mb-2 font-semibold">Appeal ID</label>
                        <InputNumber
                            v-model="appealId"
                            placeholder="Enter TRAIS Appeal ID (e.g., 46575)"
                            :useGrouping="false"
                            class="w-full"
                        />
                    </div>
                    <Button
                        label="Sync Appeal"
                        icon="pi pi-sync"
                        @click="syncAppeal"
                        :loading="syncing"
                        :disabled="!appealId"
                    />
                </div>
            </div>

            <!-- Sync History -->
            <div class="sync-history">
                <h3 class="text-xl font-semibold mb-4">Sync History</h3>
                <DataTable
                    :value="syncHistory"
                    :rows="10"
                    :paginator="true"
                    responsiveLayout="scroll"
                    stripedRows
                >
                    <Column field="appealId" header="Appeal ID" :sortable="true" />
                    <Column field="status" header="Status" :sortable="true">
                        <template #body="slotProps">
                            <Tag
                                :value="slotProps.data.status"
                                :severity="getSyncStatusSeverity(slotProps.data.status)"
                            />
                        </template>
                    </Column>
                    <Column field="timestamp" header="Timestamp" :sortable="true">
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.timestamp) }}
                        </template>
                    </Column>
                    <Column field="message" header="Message" />
                </DataTable>
            </div>

            <!-- Success/Error Messages -->
            <Message v-if="successMessage" severity="success" :closable="true" @close="successMessage = null">
                {{ successMessage }}
            </Message>
            <Message v-if="errorMessage" severity="error" :closable="true" @close="errorMessage = null">
                {{ errorMessage }}
            </Message>
        </div>

        <!-- Toast for notifications -->
        <Toast />
    </div>
</template>

<script>
import SyncService from '@/service/SyncService';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import Toast from 'primevue/toast';

export default {
    name: 'SyncManagement',
    components: {
        InputNumber,
        Button,
        DataTable,
        Column,
        Tag,
        Message,
        Toast
    },
    data() {
        return {
            appealId: null,
            syncing: false,
            syncHistory: [],
            successMessage: null,
            errorMessage: null
        };
    },
    methods: {
        async syncAppeal() {
            if (!this.appealId) return;

            this.syncing = true;
            this.successMessage = null;
            this.errorMessage = null;

            try {
                const result = await SyncService.syncAppeal(this.appealId);
                this.successMessage = `Successfully synced appeal ${this.appealId}`;

                // Add to history
                this.syncHistory.unshift({
                    appealId: this.appealId,
                    status: 'success',
                    timestamp: new Date().toISOString(),
                    message: 'Sync completed successfully'
                });

                this.$toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Appeal ${this.appealId} synced successfully`,
                    life: 3000
                });

                // Clear input
                this.appealId = null;
            } catch (error) {
                const errorMsg = error.response?.data?.message || 'Failed to sync appeal';
                this.errorMessage = errorMsg;

                // Add to history
                this.syncHistory.unshift({
                    appealId: this.appealId,
                    status: 'failed',
                    timestamp: new Date().toISOString(),
                    message: errorMsg
                });

                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMsg,
                    life: 3000
                });
            } finally {
                this.syncing = false;
            }
        },
        getSyncStatusSeverity(status) {
            return status === 'success' ? 'success' : 'danger';
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleString();
        }
    }
};
</script>

<style scoped>
.sync-management {
    padding: 1rem;
}

code {
    font-family: monospace;
    font-size: 0.875rem;
}
</style>

<template>
    <div class="case-details">
        <div class="card">
            <Button
                label="Back to Search"
                icon="pi pi-arrow-left"
                @click="$router.back()"
                class="mb-4"
                outlined
            />

            <div v-if="loading" class="text-center py-8">
                <ProgressSpinner />
                <p class="mt-4">Loading case details...</p>
            </div>

            <div v-else-if="caseData">
                <!-- Case Header -->
                <div class="case-header mb-6">
                    <h1 class="text-4xl font-bold mb-2">{{ caseData.caseNumber }}</h1>
                    <div class="flex gap-2">
                        <Tag :value="caseData.caseType" />
                        <Tag :value="caseData.status" :severity="getStatusSeverity(caseData.status)" />
                        <Tag v-if="caseData.outcome" :value="caseData.outcome" :severity="getOutcomeSeverity(caseData.outcome)" />
                    </div>
                </div>

                <!-- Case Information Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div class="info-section p-4 border rounded-lg">
                        <h3 class="text-lg font-semibold mb-3">Parties</h3>
                        <div class="space-y-2">
                            <div>
                                <p class="font-semibold text-sm text-gray-600">Appellant:</p>
                                <p class="text-lg">{{ caseData.appellant }}</p>
                            </div>
                            <div>
                                <p class="font-semibold text-sm text-gray-600">Respondent:</p>
                                <p class="text-lg">{{ caseData.respondent }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="info-section p-4 border rounded-lg">
                        <h3 class="text-lg font-semibold mb-3">Dates</h3>
                        <div class="space-y-2">
                            <div v-if="caseData.filingDate">
                                <p class="font-semibold text-sm text-gray-600">Filing Date:</p>
                                <p>{{ formatDate(caseData.filingDate) }}</p>
                            </div>
                            <div v-if="caseData.hearingDate">
                                <p class="font-semibold text-sm text-gray-600">Hearing Date:</p>
                                <p>{{ formatDate(caseData.hearingDate) }}</p>
                            </div>
                            <div v-if="caseData.decisionDate">
                                <p class="font-semibold text-sm text-gray-600">Decision Date:</p>
                                <p>{{ formatDate(caseData.decisionDate) }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="info-section p-4 border rounded-lg">
                        <h3 class="text-lg font-semibold mb-3">Board Members</h3>
                        <div class="space-y-2">
                            <div v-if="caseData.chairperson">
                                <p class="font-semibold text-sm text-gray-600">Chairperson:</p>
                                <p>{{ caseData.chairperson }}</p>
                            </div>
                            <div v-if="caseData.boardMembers && caseData.boardMembers.length">
                                <p class="font-semibold text-sm text-gray-600">Members:</p>
                                <ul class="list-disc list-inside">
                                    <li v-for="(member, index) in caseData.boardMembers" :key="index">{{ member }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="info-section p-4 border rounded-lg">
                        <h3 class="text-lg font-semibold mb-3">Financial Details</h3>
                        <div v-if="caseData.taxAmountDisputed">
                            <p class="font-semibold text-sm text-gray-600">Tax Amount Disputed:</p>
                            <p class="text-2xl font-bold text-green-600">{{ formatCurrency(caseData.taxAmountDisputed) }}</p>
                        </div>
                        <div v-else>
                            <p class="text-gray-500">No financial information available</p>
                        </div>
                    </div>
                </div>

                <!-- Documents Section -->
                <div class="documents-section mt-6">
                    <h3 class="text-xl font-semibold mb-4">Related Documents</h3>
                    <p class="text-gray-500">Document listing feature coming soon...</p>
                </div>
            </div>

            <div v-else class="text-center py-8">
                <i class="pi pi-file text-6xl text-gray-300"></i>
                <p class="text-xl text-gray-500 mt-4">Case not found</p>
            </div>

            <Message v-if="errorMessage" severity="error" :closable="true" @close="errorMessage = null">
                {{ errorMessage }}
            </Message>
        </div>
    </div>
</template>

<script>
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

export default {
    name: 'CaseDetails',
    components: {
        Button,
        Tag,
        Message,
        ProgressSpinner
    },
    data() {
        return {
            caseData: null,
            loading: false,
            errorMessage: null
        };
    },
    mounted() {
        this.loadCaseDetails();
    },
    methods: {
        async loadCaseDetails() {
            this.loading = true;
            this.errorMessage = null;
            try {
                // TODO: Implement case details API endpoint
                // For now, using mock data
                setTimeout(() => {
                    this.caseData = {
                        caseNumber: 'DSM.211/2024',
                        caseType: 'vat',
                        appellant: 'INTEGRITY SECURITY COMPANY LIMITED',
                        respondent: 'COMM GENERAL',
                        filingDate: '2024-10-29T21:00:00.000Z',
                        hearingDate: '2024-12-03T21:00:00.000Z',
                        decisionDate: '2025-01-14T21:00:00.000Z',
                        status: 'pending',
                        outcome: 'allowed',
                        taxAmountDisputed: 88828575,
                        chairperson: 'C.J David',
                        boardMembers: ['A.T Millanzi', 'Mr. G. I Mnyitafu', 'Dr. S.J Suluo']
                    };
                    this.loading = false;
                }, 1000);
            } catch (error) {
                this.errorMessage = 'Failed to load case details';
                this.loading = false;
            }
        },
        getStatusSeverity(status) {
            const severityMap = {
                'pending': 'warn',
                'decided': 'success',
                'appealed': 'info',
                'withdrawn': 'secondary',
                'settled': 'success'
            };
            return severityMap[status] || 'info';
        },
        getOutcomeSeverity(outcome) {
            const severityMap = {
                'allowed': 'success',
                'dismissed': 'danger',
                'partially_allowed': 'warn',
                'remanded': 'info'
            };
            return severityMap[outcome] || 'info';
        },
        formatCurrency(amount) {
            return new Intl.NumberFormat('en-TZ', {
                style: 'currency',
                currency: 'TZS'
            }).format(amount);
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
};
</script>

<style scoped>
.case-details {
    padding: 1rem;
}

.info-section {
    transition: all 0.3s;
}

.info-section:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>

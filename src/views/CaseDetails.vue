<template>
    <div class="case-details-container">
        <Toast />

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
            <p class="loading-text">Loading case details...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
            <div class="error-card">
                <i class="pi pi-exclamation-triangle error-icon"></i>
                <h2 class="error-title">Unable to Load Case</h2>
                <p class="error-message">{{ error }}</p>
                <div class="error-actions">
                    <Button label="Go Back" icon="pi pi-arrow-left" @click="goBack" outlined />
                    <Button label="Try Again" icon="pi pi-refresh" @click="loadCaseDetails" />
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div v-else-if="caseData" class="case-content">
            <!-- Header with Actions -->
            <div class="case-header">
                <div class="header-top">
                    <Button
                        icon="pi pi-arrow-left"
                        label="Back"
                        @click="goBack"
                        text
                        class="back-button"
                    />
                    <div class="header-actions">
                        <Button
                            icon="pi pi-copy"
                            label="Copy Citation"
                            @click="copyCitation"
                            outlined
                            severity="info"
                            v-tooltip.top="'Copy formatted legal citation'"
                        />
                        <Button
                            icon="pi pi-share-alt"
                            label="Share Link"
                            @click="shareCase"
                            outlined
                            severity="secondary"
                            v-tooltip.top="'Copy case URL to clipboard'"
                        />
                        <Button
                            icon="pi pi-print"
                            label="Print"
                            @click="printCase"
                            outlined
                            severity="secondary"
                            v-tooltip.top="'Print case details'"
                        />
                    </div>
                </div>

                <div class="header-main">
                    <div class="case-title-section">
                        <div class="case-number-badge">
                            <i class="pi pi-file"></i>
                            <span>{{ caseData.caseNumber }}</span>
                        </div>
                        <h1 class="case-title">{{ caseData.title || 'Untitled Case' }}</h1>
                        <div class="case-tags">
                            <Tag
                                :value="getCaseTypeLabel(caseData.caseType)"
                                icon="pi pi-folder"
                                severity="info"
                            />
                            <Tag
                                :value="caseData.status"
                                :severity="getStatusSeverity(caseData.status)"
                            />
                            <Tag
                                v-if="caseData.outcome"
                                :value="formatOutcome(caseData.outcome)"
                                :severity="getOutcomeSeverity(caseData.outcome)"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Two-Column Layout -->
            <div class="content-grid">
                <!-- Left Column - Case Information -->
                <div class="left-column">
                    <!-- Parties Section -->
                    <Card class="info-card">
                        <template #title>
                            <div class="card-title">
                                <i class="pi pi-users"></i>
                                <span>Parties</span>
                            </div>
                        </template>
                        <template #content>
                            <div class="info-grid">
                                <div class="info-item">
                                    <label class="info-label">Appellant</label>
                                    <p class="info-value">{{ caseData.appellant || 'N/A' }}</p>
                                    <small v-if="caseData.appellantTin" class="info-meta">
                                        TIN: {{ caseData.appellantTin }}
                                    </small>
                                </div>
                                <div class="info-item">
                                    <label class="info-label">Respondent</label>
                                    <p class="info-value">{{ caseData.respondent || 'N/A' }}</p>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Timeline & Dates -->
                    <Card class="info-card">
                        <template #title>
                            <div class="card-title">
                                <i class="pi pi-calendar"></i>
                                <span>Timeline</span>
                            </div>
                        </template>
                        <template #content>
                            <Timeline :value="timelineEvents" layout="vertical">
                                <template #marker="slotProps">
                                    <div
                                        class="timeline-marker"
                                        :class="slotProps.item.completed ? 'completed' : ''"
                                    >
                                        <i :class="slotProps.item.icon"></i>
                                    </div>
                                </template>
                                <template #content="slotProps">
                                    <div class="timeline-content">
                                        <span class="timeline-label">{{ slotProps.item.label }}</span>
                                        <span class="timeline-date">{{ slotProps.item.date }}</span>
                                    </div>
                                </template>
                            </Timeline>
                        </template>
                    </Card>

                    <!-- Board Members -->
                    <Card v-if="caseData.chairperson || (caseData.boardMembers && caseData.boardMembers.length)" class="info-card">
                        <template #title>
                            <div class="card-title">
                                <i class="pi pi-shield"></i>
                                <span>Board Composition</span>
                            </div>
                        </template>
                        <template #content>
                            <div class="board-members">
                                <div v-if="caseData.chairperson" class="board-member chairperson">
                                    <div class="member-avatar">
                                        <i class="pi pi-star-fill"></i>
                                    </div>
                                    <div class="member-info">
                                        <span class="member-name">{{ caseData.chairperson }}</span>
                                        <span class="member-role">Chairperson</span>
                                    </div>
                                </div>
                                <div
                                    v-for="(member, index) in caseData.boardMembers"
                                    :key="index"
                                    class="board-member"
                                >
                                    <div class="member-avatar">
                                        <i class="pi pi-user"></i>
                                    </div>
                                    <div class="member-info">
                                        <span class="member-name">{{ member }}</span>
                                        <span class="member-role">Board Member</span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Financial Details -->
                    <Card v-if="caseData.taxAmountDisputed || caseData.taxAmountAwarded" class="info-card">
                        <template #title>
                            <div class="card-title">
                                <i class="pi pi-money-bill"></i>
                                <span>Financial Summary</span>
                            </div>
                        </template>
                        <template #content>
                            <div class="financial-grid">
                                <div v-if="caseData.taxAmountDisputed" class="financial-item">
                                    <label class="financial-label">Tax Amount Disputed</label>
                                    <div class="financial-amount disputed">
                                        {{ formatCurrency(caseData.taxAmountDisputed, caseData.currency) }}
                                    </div>
                                </div>
                                <div v-if="caseData.taxAmountAwarded" class="financial-item">
                                    <label class="financial-label">Tax Amount Awarded</label>
                                    <div class="financial-amount awarded">
                                        {{ formatCurrency(caseData.taxAmountAwarded, caseData.currency) }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Case Details -->
                    <Card class="info-card">
                        <template #title>
                            <div class="card-title">
                                <i class="pi pi-info-circle"></i>
                                <span>Case Details</span>
                            </div>
                        </template>
                        <template #content>
                            <div class="details-list">
                                <div v-if="caseData.summary" class="detail-item">
                                    <label class="detail-label">Summary</label>
                                    <p class="detail-value">{{ caseData.summary }}</p>
                                </div>
                                <div v-if="caseData.keyIssues && caseData.keyIssues.length" class="detail-item">
                                    <label class="detail-label">Key Issues</label>
                                    <ul class="detail-list">
                                        <li v-for="(issue, index) in caseData.keyIssues" :key="index">
                                            {{ issue }}
                                        </li>
                                    </ul>
                                </div>
                                <div v-if="caseData.legalPrinciples && caseData.legalPrinciples.length" class="detail-item">
                                    <label class="detail-label">Legal Principles</label>
                                    <ul class="detail-list">
                                        <li v-for="(principle, index) in caseData.legalPrinciples" :key="index">
                                            {{ principle }}
                                        </li>
                                    </ul>
                                </div>
                                <div v-if="caseData.statutesCited && caseData.statutesCited.length" class="detail-item">
                                    <label class="detail-label">Statutes Cited</label>
                                    <div class="citations">
                                        <Chip
                                            v-for="(statute, index) in caseData.statutesCited"
                                            :key="index"
                                            :label="statute"
                                            class="citation-chip"
                                        />
                                    </div>
                                </div>
                                <div v-if="caseData.casesCited && caseData.casesCited.length" class="detail-item">
                                    <label class="detail-label">Cases Cited</label>
                                    <div class="citations">
                                        <Chip
                                            v-for="(citedCase, index) in caseData.casesCited"
                                            :key="index"
                                            :label="citedCase"
                                            class="citation-chip"
                                        />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <!-- Right Column - Documents & PDF Preview -->
                <div class="right-column">
                    <!-- Documents List -->
                    <Card class="documents-card">
                        <template #title>
                            <div class="card-title">
                                <i class="pi pi-file-pdf"></i>
                                <span>Documents ({{ documents.length }})</span>
                            </div>
                        </template>
                        <template #content>
                            <div v-if="documentsLoading" class="documents-loading">
                                <ProgressSpinner style="width: 30px; height: 30px" />
                                <span>Loading documents...</span>
                            </div>
                            <div v-else-if="documents.length === 0" class="no-documents">
                                <i class="pi pi-inbox"></i>
                                <p>No documents available</p>
                            </div>
                            <div v-else class="documents-list">
                                <div
                                    v-for="doc in documents"
                                    :key="doc.id"
                                    class="document-item"
                                    :class="{ active: selectedDocument?.id === doc.id }"
                                    @click="selectDocument(doc)"
                                >
                                    <div class="document-icon">
                                        <i class="pi pi-file-pdf"></i>
                                    </div>
                                    <div class="document-info">
                                        <span class="document-name">{{ doc.fileName }}</span>
                                        <div class="document-meta">
                                            <span class="document-type">{{ formatDocType(doc.documentType) }}</span>
                                            <span class="document-size">{{ formatFileSize(doc.fileSize) }}</span>
                                            <Tag
                                                v-if="doc.ocrStatus"
                                                :value="doc.ocrStatus"
                                                :severity="getOcrStatusSeverity(doc.ocrStatus)"
                                                size="small"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        icon="pi pi-download"
                                        text
                                        rounded
                                        @click.stop="downloadDocument(doc)"
                                        severity="secondary"
                                    />
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- PDF Preview -->
                    <Card v-if="selectedDocument" class="pdf-preview-card">
                        <template #title>
                            <div class="card-title">
                                <i class="pi pi-eye"></i>
                                <span>Document Preview</span>
                            </div>
                        </template>
                        <template #content>
                            <div class="pdf-preview-container">
                                <div class="pdf-toolbar">
                                    <span class="preview-filename">{{ selectedDocument.fileName }}</span>
                                    <div class="toolbar-actions">
                                        <Button
                                            icon="pi pi-download"
                                            label="Download"
                                            @click="downloadDocument(selectedDocument)"
                                            text
                                            size="small"
                                        />
                                        <Button
                                            icon="pi pi-external-link"
                                            label="Open in New Tab"
                                            @click="openInNewTab(selectedDocument)"
                                            text
                                            size="small"
                                        />
                                    </div>
                                </div>
                                <div class="pdf-viewer">
                                    <iframe
                                        v-if="pdfPreviewUrl"
                                        :src="pdfPreviewUrl"
                                        class="pdf-iframe"
                                        frameborder="0"
                                        @load="onPdfLoad"
                                        @error="onPdfError"
                                    ></iframe>
                                    <div v-else class="pdf-placeholder">
                                        <ProgressSpinner style="width: 40px; height: 40px" />
                                        <p>Loading PDF preview...</p>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Empty State when no document selected -->
                    <Card v-else-if="documents.length > 0" class="pdf-preview-card">
                        <template #content>
                            <div class="no-preview-state">
                                <i class="pi pi-file-pdf"></i>
                                <p>Select a document to preview</p>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Chip from 'primevue/chip';
import Timeline from 'primevue/timeline';
import ProgressSpinner from 'primevue/progressspinner';
import Toast from 'primevue/toast';
import CaseService from '@/service/CaseService';
import AuthService from '@/service/AuthService';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const caseData = ref(null);
const documents = ref([]);
const selectedDocument = ref(null);
const loading = ref(false);
const documentsLoading = ref(false);
const error = ref(null);
const pdfPreviewUrl = ref(null);

// Computed properties
const timelineEvents = computed(() => {
    if (!caseData.value) return [];

    const events = [];

    if (caseData.value.filingDate) {
        events.push({
            label: 'Case Filed',
            date: CaseService.formatDate(caseData.value.filingDate),
            icon: 'pi pi-file',
            completed: true
        });
    }

    if (caseData.value.hearingDate) {
        events.push({
            label: 'Hearing',
            date: CaseService.formatDate(caseData.value.hearingDate),
            icon: 'pi pi-volume-up',
            completed: caseData.value.decisionDate ? true : false
        });
    }

    if (caseData.value.decisionDate) {
        events.push({
            label: 'Decision',
            date: CaseService.formatDate(caseData.value.decisionDate),
            icon: 'pi pi-check-circle',
            completed: true
        });
    }

    return events;
});

// Methods
async function loadCaseDetails() {
    loading.value = true;
    error.value = null;

    try {
        const caseId = route.params.id;
        const caseNumber = route.query.caseNumber;

        // Fetch case by ID or case number
        if (caseId) {
            caseData.value = await CaseService.getCaseById(caseId);
        } else if (caseNumber) {
            caseData.value = await CaseService.getCaseByCaseNumber(caseNumber);
        } else {
            throw new Error('No case identifier provided');
        }

        // Load documents
        await loadDocuments();
    } catch (err) {
        console.error('Load case details error:', err);
        error.value = err.message || 'Failed to load case details';
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.value,
            life: 5000
        });
    } finally {
        loading.value = false;
    }
}

async function loadDocuments() {
    if (!caseData.value?.id) return;

    documentsLoading.value = true;
    try {
        const response = await CaseService.getCaseDocuments(caseData.value.id);
        documents.value = response.documents || [];

        // Auto-select first decision document
        const decisionDoc = documents.value.find(doc => doc.documentType === 'decision');
        if (decisionDoc) {
            selectDocument(decisionDoc);
        } else if (documents.value.length > 0) {
            selectDocument(documents.value[0]);
        }
    } catch (err) {
        console.error('Load documents error:', err);
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Could not load case documents',
            life: 3000
        });
    } finally {
        documentsLoading.value = false;
    }
}

function selectDocument(doc) {
    selectedDocument.value = doc;
    loadPdfPreview(doc);
}

function loadPdfPreview(doc) {
    const token = AuthService.getAccessToken();
    // Create authenticated URL with token in header (handled by iframe)
    // For browser PDF viewer, we need to use a different approach
    pdfPreviewUrl.value = `${CaseService.getDocumentStreamUrl(doc.id)}#toolbar=1&navpanes=1`;

    // Alternative: Load as blob URL
    // This ensures proper authentication
    CaseService.getDocumentBlob(doc.id)
        .then(blob => {
            const url = URL.createObjectURL(blob);
            pdfPreviewUrl.value = url;
        })
        .catch(err => {
            console.error('PDF preview error:', err);
            toast.add({
                severity: 'error',
                summary: 'Preview Error',
                detail: 'Could not load PDF preview',
                life: 3000
            });
        });
}

async function downloadDocument(doc) {
    try {
        await CaseService.downloadDocument(doc.id, doc.fileName);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Document downloaded successfully',
            life: 3000
        });
    } catch (err) {
        console.error('Download error:', err);
        toast.add({
            severity: 'error',
            summary: 'Download Failed',
            detail: err.message || 'Could not download document',
            life: 3000
        });
    }
}

function openInNewTab(doc) {
    const url = CaseService.getDocumentStreamUrl(doc.id);
    window.open(url, '_blank');
}

function goBack() {
    router.back();
}

function printCase() {
    window.print();
}

function copyCitation() {
    if (!caseData.value) return;

    // Generate formatted legal citation
    // Format: Appellant v. Respondent, [Case Number] TRAB ([Decision Year])
    const year = caseData.value.decisionDate ? new Date(caseData.value.decisionDate).getFullYear() : 'n.d.';
    const appellant = caseData.value.appellant || 'Unknown Appellant';
    const respondent = caseData.value.respondent || 'Commissioner General (TRA)';
    const caseNumber = caseData.value.caseNumber || 'No case number';

    // Standard legal citation format
    const citation = `${appellant} v. ${respondent}, ${caseNumber} (TRAB ${year})`;

    // Extended citation with outcome if available
    let fullCitation = citation;
    if (caseData.value.outcome) {
        const outcome = formatOutcome(caseData.value.outcome);
        fullCitation += ` - ${outcome}`;
    }
    if (caseData.value.decisionDate) {
        fullCitation += `, decided ${CaseService.formatDate(caseData.value.decisionDate)}`;
    }

    navigator.clipboard.writeText(fullCitation).then(() => {
        toast.add({
            severity: 'success',
            summary: 'Citation Copied',
            detail: 'Legal citation copied to clipboard',
            life: 3000
        });
    }).catch(() => {
        toast.add({
            severity: 'error',
            summary: 'Copy Failed',
            detail: 'Could not copy citation to clipboard',
            life: 3000
        });
    });
}

function shareCase() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        toast.add({
            severity: 'success',
            summary: 'Link Copied',
            detail: 'Case URL copied to clipboard',
            life: 3000
        });
    }).catch(() => {
        toast.add({
            severity: 'error',
            summary: 'Copy Failed',
            detail: 'Could not copy URL to clipboard',
            life: 3000
        });
    });
}

function onPdfLoad() {
    console.log('PDF loaded successfully');
}

function onPdfError() {
    toast.add({
        severity: 'error',
        summary: 'Preview Error',
        detail: 'Could not load PDF preview',
        life: 3000
    });
}

// Helper functions
const formatCurrency = CaseService.formatCurrency;
const getCaseTypeLabel = CaseService.getCaseTypeLabel;
const getStatusSeverity = CaseService.getStatusSeverity;
const getOutcomeSeverity = CaseService.getOutcomeSeverity;

function formatOutcome(outcome) {
    return outcome.replace(/_/g, ' ').toUpperCase();
}

function formatDocType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
}

function formatFileSize(bytes) {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
}

function getOcrStatusSeverity(status) {
    const map = {
        'completed': 'success',
        'processing': 'info',
        'pending': 'warn',
        'failed': 'danger',
        'manual_review': 'warn'
    };
    return map[status] || 'info';
}

// Lifecycle
onMounted(() => {
    loadCaseDetails();
});
</script>

<style scoped>
/* ==========================================
   MODERN ENTERPRISE CASE DETAILS STYLING
   ========================================== */

.case-details-container {
    min-height: 100vh;
    background: #F8FAFC;
    padding: 2rem;
}

/* Loading & Error States */
.loading-state,
.error-state {
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

.error-card {
    background: #FFFFFF;
    border-radius: 12px;
    padding: 3rem 2rem;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    max-width: 500px;
}

.error-icon {
    font-size: 4rem;
    color: #EF4444;
    margin-bottom: 1.5rem;
}

.error-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1B365D;
    margin-bottom: 0.75rem;
}

.error-message {
    color: #64748B;
    margin-bottom: 2rem;
}

.error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

/* Header */
.case-header {
    background: #FFFFFF;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.back-button {
    font-weight: 600;
    color: #1B365D;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

.header-main {
    border-top: 1px solid #E2E8F0;
    padding-top: 2rem;
}

.case-number-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #1B365D 0%, #2A4A7C 100%);
    color: #D4AF37;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.875rem;
    margin-bottom: 1rem;
}

.case-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1B365D;
    margin-bottom: 1rem;
    line-height: 1.3;
}

.case-tags {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

/* Content Grid */
.content-grid {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 1.5rem;
    align-items: start;
}

.left-column {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-height: calc(100vh - 180px);
    overflow-y: auto;
    padding-right: 0.5rem;
}

.left-column::-webkit-scrollbar {
    width: 6px;
}

.left-column::-webkit-scrollbar-track {
    background: #F1F5F9;
    border-radius: 3px;
}

.left-column::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 3px;
}

.left-column::-webkit-scrollbar-thumb:hover {
    background: #94A3B8;
}

.right-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: sticky;
    top: 1rem;
    height: calc(100vh - 160px);
}

/* Cards */
.info-card,
.documents-card,
.pdf-preview-card {
    background: #FFFFFF;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    border: 1px solid #E2E8F0;
}

:deep(.p-card-title) {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #E2E8F0;
}

:deep(.p-card-content) {
    padding: 1.25rem;
}

.documents-card :deep(.p-card-content) {
    padding: 1rem 1.25rem;
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

.documents-card .card-title {
    font-size: 0.9375rem;
}

/* Info Grid */
.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.25rem;
}

.info-item {
    display: flex;
    flex-direction: column;
}

.info-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.375rem;
}

.info-value {
    font-size: 1rem;
    font-weight: 600;
    color: #1B365D;
    margin: 0;
    line-height: 1.4;
}

.info-meta {
    color: #94A3B8;
    font-size: 0.8125rem;
    margin-top: 0.25rem;
}

/* Timeline */
:deep(.p-timeline) {
    padding: 0;
}

:deep(.p-timeline-event-connector) {
    background: #E2E8F0;
}

.timeline-marker {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #F1F5F9;
    border: 2px solid #CBD5E1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748B;
    font-size: 1rem;
}

.timeline-marker.completed {
    background: linear-gradient(135deg, #1B365D 0%, #2A4A7C 100%);
    border-color: #1B365D;
    color: #D4AF37;
}

.timeline-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-bottom: 1.5rem;
}

.timeline-label {
    font-weight: 600;
    color: #1B365D;
    font-size: 0.9375rem;
}

.timeline-date {
    font-size: 0.875rem;
    color: #64748B;
}

/* Board Members */
.board-members {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.board-member {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.75rem;
    border-radius: 6px;
    background: #F8FAFC;
    transition: all 0.2s;
}

.board-member:hover {
    background: #F1F5F9;
}

.board-member.chairperson {
    background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
}

.member-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1B365D 0%, #2A4A7C 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #D4AF37;
    font-size: 1rem;
    flex-shrink: 0;
}

.board-member.chairperson .member-avatar {
    background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
    color: #1B365D;
}

.member-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
}

.member-name {
    font-weight: 600;
    color: #1B365D;
    font-size: 0.875rem;
}

.member-role {
    font-size: 0.75rem;
    color: #64748B;
}

/* Financial Grid */
.financial-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.financial-item {
    padding: 1.25rem;
    border-radius: 8px;
    background: #F8FAFC;
}

.financial-label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.75rem;
}

.financial-amount {
    font-size: 1.75rem;
    font-weight: 700;
}

.financial-amount.disputed {
    color: #DC2626;
}

.financial-amount.awarded {
    color: #059669;
}

/* Details List */
.details-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
}

.detail-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.625rem;
}

.detail-value {
    color: #334155;
    line-height: 1.6;
    margin: 0;
    font-size: 0.9375rem;
}

.detail-list {
    margin: 0;
    padding-left: 1.25rem;
    color: #334155;
    line-height: 1.7;
    font-size: 0.9375rem;
}

.citations {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.citation-chip {
    background: #E0E7FF;
    color: #3730A3;
}

/* Documents List */
.documents-loading,
.no-documents {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    color: #94A3B8;
}

.no-documents i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.documents-list {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 0.5rem;
}

.documents-list::-webkit-scrollbar {
    width: 5px;
}

.documents-list::-webkit-scrollbar-track {
    background: #F1F5F9;
    border-radius: 3px;
}

.documents-list::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 3px;
}

.documents-list::-webkit-scrollbar-thumb:hover {
    background: #94A3B8;
}

.document-item {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.875rem;
    border-radius: 6px;
    border: 2px solid transparent;
    background: #F8FAFC;
    cursor: pointer;
    transition: all 0.2s;
}

.document-item:hover {
    background: #F1F5F9;
    border-color: #CBD5E1;
}

.document-item.active {
    background: #EEF2FF;
    border-color: #1B365D;
}

.document-icon {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-size: 1.125rem;
    flex-shrink: 0;
}

.document-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.document-name {
    font-weight: 600;
    color: #1B365D;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.document-meta {
    display: flex;
    gap: 0.625rem;
    align-items: center;
    flex-wrap: wrap;
}

.document-type,
.document-size {
    font-size: 0.75rem;
    color: #64748B;
}

/* PDF Preview */
.pdf-preview-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
}

.pdf-preview-card :deep(.p-card-body) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    padding: 0;
}

.pdf-preview-card :deep(.p-card-content) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem 1.25rem 1.25rem;
    min-height: 0;
}

.pdf-preview-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
}

.pdf-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.875rem;
    border-bottom: 1px solid #E2E8F0;
    margin-bottom: 1rem;
    flex-shrink: 0;
}

.preview-filename {
    font-weight: 600;
    color: #1B365D;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 400px;
}

.toolbar-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
}

.pdf-viewer {
    flex: 1;
    min-height: 0;
    border-radius: 4px;
    overflow: hidden;
    background: #525252;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: #525252;
    display: block;
}

.pdf-placeholder,
.no-preview-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #94A3B8;
}

.no-preview-state i {
    font-size: 4rem;
    margin-bottom: 1rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
    .content-grid {
        grid-template-columns: 1fr;
    }

    .right-column {
        position: static;
    }
}

@media (max-width: 768px) {
    .case-details-container {
        padding: 1rem;
    }

    .case-header {
        padding: 1.5rem 1rem;
    }

    .header-top {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .case-title {
        font-size: 1.5rem;
    }

    .info-grid,
    .financial-grid {
        grid-template-columns: 1fr;
    }

    .pdf-viewer,
    .pdf-iframe {
        min-height: 500px;
    }
}

/* Print Styles */
@media print {
    .header-actions,
    .back-button,
    .pdf-toolbar,
    .documents-card {
        display: none !important;
    }

    .content-grid {
        grid-template-columns: 1fr;
    }

    .right-column {
        display: none;
    }
}
</style>

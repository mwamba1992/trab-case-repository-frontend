<template>
    <div class="enterprise-search">
        <!-- Header with Language Toggle -->
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-semibold text-gov-navy">{{ t('caseRepositorySearch') }}</h1>
            <div class="flex gap-3 items-center">
                <Button
                    :label="currentLang === 'en' ? 'SW' : 'EN'"
                    @click="toggleLanguage"
                    severity="secondary"
                    outlined
                    size="small"
                    class="gov-button-secondary"
                    :title="t('switchLanguage')"
                />
            </div>
        </div>

        <!-- Main Search Container -->
        <div class="gov-card">
            <!-- Search Bar -->
            <div class="search-header mb-4">
                <div class="flex gap-2">
                    <div class="flex-1">
                        <InputText
                            v-model="searchQuery"
                            :placeholder="t('searchPlaceholder')"
                            class="w-full gov-input"
                            @keyup.enter="performSearch"
                            :aria-label="t('searchInput')"
                        />
                    </div>
                    <Button
                        :label="t('search')"
                        icon="pi pi-search"
                        @click="performSearch"
                        :loading="loading"
                        class="gov-button-primary"
                        :aria-label="t('searchButton')"
                    />
                    <Button
                        icon="pi pi-filter"
                        @click="showAdvancedSearch = !showAdvancedSearch"
                        :label="t('advanced')"
                        severity="secondary"
                        outlined
                        class="gov-button-secondary"
                        :aria-label="t('toggleAdvancedSearch')"
                    />
                </div>
            </div>

            <!-- Quick Filters -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <div>
                    <label class="gov-label">{{ t('searchType') }}</label>
                    <Select
                        v-model="searchType"
                        :options="searchTypes"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full gov-select"
                    />
                </div>
                <div>
                    <label class="gov-label">{{ t('resultsLimit') }}</label>
                    <InputNumber
                        v-model="resultLimit"
                        :min="1"
                        :max="100"
                        class="w-full gov-input"
                    />
                </div>
                <div>
                    <label class="gov-label">{{ t('viewMode') }}</label>
                    <Select
                        v-model="viewMode"
                        :options="viewModes"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full gov-select"
                    />
                </div>
                <div v-if="searchResults">
                    <label class="gov-label">{{ t('executionTime') }}</label>
                    <p class="text-lg font-semibold text-gov-navy">{{ searchResults.executionTimeMs }}ms</p>
                </div>
            </div>

            <!-- Advanced Search Panel (Collapsible) -->
            <Panel v-if="showAdvancedSearch" :header="t('advancedSearchOptions')" :toggleable="true" class="mb-4 gov-panel">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="gov-label">{{ t('fullTextWeight') }}: {{ ftWeight }}</label>
                        <Slider v-model="ftWeight" :min="0" :max="1" :step="0.1" class="gov-slider" />
                    </div>
                    <div>
                        <label class="gov-label">{{ t('semanticWeight') }}: {{ semWeight }}</label>
                        <Slider v-model="semWeight" :min="0" :max="1" :step="0.1" class="gov-slider" />
                    </div>
                </div>
            </Panel>
        </div>

        <!-- Results Section -->
        <div v-if="searchResults && searchResults.results.length > 0" class="mt-4">
            <!-- Results Header with Batch Actions -->
            <div class="gov-card mb-3">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-4">
                        <h2 class="text-lg font-semibold text-gov-navy">
                            {{ t('foundResults', { count: searchResults.totalResults }) }}
                        </h2>
                        <div class="gov-badge">{{ searchResults.searchType }}</div>
                    </div>
                    <div class="flex gap-2" v-if="selectedCases.length > 0">
                        <Button
                            :label="t('exportSelected', { count: selectedCases.length })"
                            icon="pi pi-download"
                            size="small"
                            severity="secondary"
                            outlined
                            class="gov-button-secondary"
                            @click="exportSelected"
                        />
                        <Button
                            :label="t('clearSelection')"
                            icon="pi pi-times"
                            size="small"
                            severity="secondary"
                            outlined
                            class="gov-button-secondary"
                            @click="selectedCases = []"
                        />
                    </div>
                </div>
            </div>

            <!-- Compact Table View -->
            <div v-if="viewMode === 'table'" class="gov-card">
                <DataTable
                    :value="searchResults.results"
                    v-model:selection="selectedCases"
                    dataKey="documentId"
                    :paginator="true"
                    :rows="resultLimit"
                    stripedRows
                    class="gov-table"
                    responsiveLayout="scroll"
                >
                    <Column selectionMode="multiple" headerStyle="width: 3rem" class="gov-table-checkbox"></Column>
                    <Column field="caseMetadata.caseNumber" :header="t('caseNumber')" sortable style="min-width: 140px">
                        <template #body="slotProps">
                            <span class="font-semibold text-gov-navy">{{ slotProps.data.caseMetadata.caseNumber }}</span>
                        </template>
                    </Column>
                    <Column field="caseMetadata.appellant" :header="t('appellant')" sortable style="min-width: 200px"></Column>
                    <Column field="caseMetadata.caseType" :header="t('caseType')" sortable style="min-width: 120px">
                        <template #body="slotProps">
                            <div class="gov-badge-type">{{ slotProps.data.caseMetadata.caseType.toUpperCase() }}</div>
                        </template>
                    </Column>
                    <Column field="caseMetadata.status" :header="t('status')" sortable style="min-width: 120px">
                        <template #body="slotProps">
                            <div class="status-timeline">
                                {{ getStatusStep(slotProps.data.caseMetadata.status) }}
                            </div>
                        </template>
                    </Column>
                    <Column field="caseMetadata.taxAmountDisputed" :header="t('taxAmount')" sortable style="min-width: 150px">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.caseMetadata.taxAmountDisputed" class="font-semibold">
                                {{ formatCurrency(slotProps.data.caseMetadata.taxAmountDisputed) }}
                            </span>
                            <span v-else class="text-gray-400">-</span>
                        </template>
                    </Column>
                    <Column field="caseMetadata.outcome" :header="t('outcome')" sortable style="min-width: 140px">
                        <template #body="slotProps">
                            <div v-if="slotProps.data.caseMetadata.outcome"
                                 :class="getOutcomeClass(slotProps.data.caseMetadata.outcome)"
                                 class="gov-badge-outcome">
                                {{ slotProps.data.caseMetadata.outcome }}
                            </div>
                            <span v-else class="text-gray-400">{{ t('pending') }}</span>
                        </template>
                    </Column>
                    <Column field="pageNumber" :header="t('page')" sortable style="width: 80px"></Column>
                    <Column :header="t('actions')" style="width: 100px">
                        <template #body="slotProps">
                            <Button
                                icon="pi pi-eye"
                                size="small"
                                severity="secondary"
                                text
                                @click="viewCaseDetails(slotProps.data.caseId)"
                                :aria-label="t('viewDetails')"
                            />
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- Card View -->
            <div v-else class="space-y-3">
                <div v-for="(result, index) in searchResults.results" :key="index" class="gov-card-result">
                    <!-- Card Header -->
                    <div class="result-header">
                        <div class="flex items-start gap-3">
                            <Checkbox
                                v-model="selectedCases"
                                :inputId="`case-${index}`"
                                :value="result"
                                class="mt-1"
                            />
                            <div class="flex-1">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="text-lg font-bold text-gov-navy mb-1">{{ result.caseMetadata.caseNumber }}</h3>
                                        <p class="text-sm text-gray-600">{{ result.documentName }} • {{ t('page') }} {{ result.pageNumber }}</p>
                                    </div>
                                    <div class="flex gap-2">
                                        <div class="gov-badge-score">{{ t('score') }}: {{ result.score.toFixed(3) }}</div>
                                        <div class="gov-badge">{{ result.matchType }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Status Timeline -->
                    <div class="status-timeline-container">
                        <div class="status-steps">
                            <div :class="['status-step', { active: isStepActive(result.caseMetadata, 'filed') }]">
                                <div class="step-circle"></div>
                                <span>{{ t('filed') }}</span>
                            </div>
                            <div class="step-line" :class="{ active: isStepActive(result.caseMetadata, 'review') }"></div>
                            <div :class="['status-step', { active: isStepActive(result.caseMetadata, 'review') }]">
                                <div class="step-circle"></div>
                                <span>{{ t('review') }}</span>
                            </div>
                            <div class="step-line" :class="{ active: isStepActive(result.caseMetadata, 'hearing') }"></div>
                            <div :class="['status-step', { active: isStepActive(result.caseMetadata, 'hearing') }]">
                                <div class="step-circle"></div>
                                <span>{{ t('hearing') }}</span>
                            </div>
                            <div class="step-line" :class="{ active: isStepActive(result.caseMetadata, 'decided') }"></div>
                            <div :class="['status-step', { active: isStepActive(result.caseMetadata, 'decided') }]">
                                <div class="step-circle"></div>
                                <span>{{ t('decided') }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Structured Metadata Grid -->
                    <div class="metadata-grid">
                        <div class="metadata-item">
                            <span class="metadata-label">{{ t('caseType') }}</span>
                            <span class="metadata-value gov-badge-type">{{ result.caseMetadata.caseType.toUpperCase() }}</span>
                        </div>
                        <div class="metadata-item">
                            <span class="metadata-label">{{ t('status') }}</span>
                            <span class="metadata-value">{{ result.caseMetadata.status }}</span>
                        </div>
                        <div class="metadata-item">
                            <span class="metadata-label">{{ t('outcome') }}</span>
                            <span v-if="result.caseMetadata.outcome"
                                  :class="getOutcomeClass(result.caseMetadata.outcome)"
                                  class="metadata-value gov-badge-outcome">
                                {{ result.caseMetadata.outcome }}
                            </span>
                            <span v-else class="metadata-value text-gray-400">{{ t('pending') }}</span>
                        </div>
                        <div class="metadata-item">
                            <span class="metadata-label">{{ t('appellant') }}</span>
                            <span class="metadata-value">{{ result.caseMetadata.appellant }}</span>
                        </div>
                        <div class="metadata-item">
                            <span class="metadata-label">{{ t('respondent') }}</span>
                            <span class="metadata-value">{{ result.caseMetadata.respondent }}</span>
                        </div>
                        <div class="metadata-item" v-if="result.caseMetadata.taxAmountDisputed">
                            <span class="metadata-label">{{ t('taxAmountDisputed') }}</span>
                            <span class="metadata-value font-semibold">{{ formatCurrency(result.caseMetadata.taxAmountDisputed) }}</span>
                        </div>
                    </div>

                    <!-- Content Snippet -->
                    <div class="content-preview">
                        <p class="text-sm" v-html="highlightText(result.content)"></p>
                    </div>

                    <!-- Audit Trail -->
                    <div class="audit-trail">
                        <div class="flex justify-between items-center text-xs text-gray-500">
                            <span>{{ t('lastUpdated') }}: {{ formatDate(result.caseMetadata.decisionDate || result.caseMetadata.filingDate) }}</span>
                            <Button
                                :label="t('viewDetails')"
                                icon="pi pi-arrow-right"
                                size="small"
                                severity="secondary"
                                text
                                @click="viewCaseDetails(result.caseId)"
                                class="gov-button-text"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- No Results -->
        <div v-else-if="searchResults && searchResults.results.length === 0" class="gov-card text-center py-12">
            <i class="pi pi-search text-6xl text-gray-300 mb-4"></i>
            <p class="text-xl text-gray-600">{{ t('noResultsFound', { query: searchQuery }) }}</p>
        </div>

        <!-- Error Message -->
        <Message v-if="errorMessage" severity="error" :closable="true" @close="errorMessage = null" class="mt-4">
            {{ errorMessage }}
        </Message>
    </div>
</template>

<script>
import SearchService from '@/service/SearchService';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';
import Panel from 'primevue/panel';
import Message from 'primevue/message';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Checkbox from 'primevue/checkbox';

export default {
    name: 'SearchCasesEnterprise',
    components: {
        InputText,
        Button,
        Select,
        InputNumber,
        Slider,
        Panel,
        Message,
        DataTable,
        Column,
        Checkbox
    },
    data() {
        return {
            searchQuery: '',
            searchType: 'hybrid',
            searchTypes: [
                { label: 'Hybrid (Recommended)', value: 'hybrid' },
                { label: 'Full-Text', value: 'full-text' },
                { label: 'Semantic', value: 'semantic' }
            ],
            viewMode: 'cards',
            viewModes: [
                { label: 'Card View', value: 'cards' },
                { label: 'Table View', value: 'table' }
            ],
            resultLimit: 10,
            ftWeight: 0.5,
            semWeight: 0.5,
            searchResults: null,
            loading: false,
            errorMessage: null,
            showAdvancedSearch: false,
            selectedCases: [],
            currentLang: 'en',
            translations: {
                en: {
                    caseRepositorySearch: 'Case Repository Search',
                    search: 'Search',
                    advanced: 'Advanced',
                    searchPlaceholder: 'Search cases by keywords, case number, or appellant...',
                    searchType: 'Search Type',
                    resultsLimit: 'Results Limit',
                    viewMode: 'View Mode',
                    executionTime: 'Execution Time',
                    advancedSearchOptions: 'Advanced Search Options',
                    fullTextWeight: 'Full-Text Weight',
                    semanticWeight: 'Semantic Weight',
                    foundResults: 'Found {count} results',
                    exportSelected: 'Export ({count})',
                    clearSelection: 'Clear Selection',
                    caseNumber: 'Case Number',
                    appellant: 'Appellant',
                    caseType: 'Case Type',
                    status: 'Status',
                    taxAmount: 'Tax Amount Disputed',
                    outcome: 'Outcome',
                    page: 'Page',
                    actions: 'Actions',
                    viewDetails: 'View Details',
                    score: 'Score',
                    filed: 'Filed',
                    review: 'Review',
                    hearing: 'Hearing',
                    decided: 'Decided',
                    respondent: 'Respondent',
                    taxAmountDisputed: 'Tax Amount Disputed',
                    lastUpdated: 'Last Updated',
                    pending: 'Pending',
                    noResultsFound: 'No results found for "{query}"',
                    switchLanguage: 'Switch Language',
                    searchInput: 'Search input',
                    searchButton: 'Search button',
                    toggleAdvancedSearch: 'Toggle advanced search'
                },
                sw: {
                    caseRepositorySearch: 'Utafutaji wa Kesi',
                    search: 'Tafuta',
                    advanced: 'Ya Kina',
                    searchPlaceholder: 'Tafuta kesi kwa maneno muhimu, namba ya kesi, au mshtakiwa...',
                    searchType: 'Aina ya Utafutaji',
                    resultsLimit: 'Kikomo cha Matokeo',
                    viewMode: 'Mtazamo',
                    executionTime: 'Muda wa Utekelezaji',
                    advancedSearchOptions: 'Chaguo za Utafutaji wa Kina',
                    fullTextWeight: 'Uzito wa Maandishi Kamili',
                    semanticWeight: 'Uzito wa Kimantiki',
                    foundResults: 'Matokeo {count} yamepatikana',
                    exportSelected: 'Hamisha ({count})',
                    clearSelection: 'Futa Uchaguzi',
                    caseNumber: 'Namba ya Kesi',
                    appellant: 'Mshtakiwa',
                    caseType: 'Aina ya Kesi',
                    status: 'Hali',
                    taxAmount: 'Kiasi cha Kodi Kinachobishaniwa',
                    outcome: 'Matokeo',
                    page: 'Ukurasa',
                    actions: 'Vitendo',
                    viewDetails: 'Tazama Maelezo',
                    score: 'Alama',
                    filed: 'Imesajiliwa',
                    review: 'Mapitio',
                    hearing: 'Kusikilizwa',
                    decided: 'Imeamuliwa',
                    respondent: 'Mjibu',
                    taxAmountDisputed: 'Kiasi cha Kodi Kinachobishaniwa',
                    lastUpdated: 'Imesasishwa Mwisho',
                    pending: 'Inasubiri',
                    noResultsFound: 'Hakuna matokeo yaliyopatikana kwa "{query}"',
                    switchLanguage: 'Badilisha Lugha',
                    searchInput: 'Ingizo la utafutaji',
                    searchButton: 'Kitufe cha utafutaji',
                    toggleAdvancedSearch: 'Geuza utafutaji wa kina'
                }
            }
        };
    },
    methods: {
        t(key, params = {}) {
            let text = this.translations[this.currentLang][key] || key;
            Object.keys(params).forEach(param => {
                text = text.replace(`{${param}}`, params[param]);
            });
            return text;
        },
        toggleLanguage() {
            this.currentLang = this.currentLang === 'en' ? 'sw' : 'en';
        },
        async performSearch() {
            if (!this.searchQuery.trim()) {
                this.errorMessage = this.t('searchPlaceholder');
                return;
            }

            this.loading = true;
            this.errorMessage = null;

            try {
                let results;
                switch (this.searchType) {
                    case 'hybrid':
                        results = await SearchService.hybridSearch(
                            this.searchQuery,
                            this.resultLimit,
                            this.ftWeight,
                            this.semWeight
                        );
                        break;
                    case 'full-text':
                        results = await SearchService.fullTextSearch(this.searchQuery, this.resultLimit);
                        break;
                    case 'semantic':
                        results = await SearchService.semanticSearch(this.searchQuery, this.resultLimit);
                        break;
                }
                this.searchResults = results;
            } catch (error) {
                this.errorMessage = error.response?.data?.message || 'An error occurred while searching';
            } finally {
                this.loading = false;
            }
        },
        getStatusStep(status) {
            const steps = {
                'pending': '1/4 Filed',
                'decided': '4/4 Decided',
                'appealed': '3/4 Hearing',
                'withdrawn': 'Withdrawn'
            };
            return steps[status] || '1/4 Filed';
        },
        isStepActive(caseData, step) {
            const statusOrder = ['filed', 'review', 'hearing', 'decided'];
            const currentIndex = caseData.status === 'pending' ? 0 :
                                caseData.status === 'decided' ? 3 :
                                caseData.hearingDate ? 2 : 1;
            const stepIndex = statusOrder.indexOf(step);
            return stepIndex <= currentIndex;
        },
        getOutcomeClass(outcome) {
            const classes = {
                'allowed': 'outcome-allowed',
                'dismissed': 'outcome-dismissed',
                'partially_allowed': 'outcome-partial',
                'remanded': 'outcome-remanded'
            };
            return classes[outcome] || '';
        },
        formatCurrency(amount) {
            return new Intl.NumberFormat('en-TZ', {
                style: 'currency',
                currency: 'TZS',
                minimumFractionDigits: 0
            }).format(amount);
        },
        formatDate(dateString) {
            if (!dateString) return '-';
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        viewCaseDetails(caseId) {
            this.$router.push({ name: 'CaseDetails', params: { id: caseId } });
        },
        highlightText(content) {
            if (!this.searchQuery || !content) return content;
            const searchTerms = this.searchQuery.trim().split(/\s+/);
            const pattern = searchTerms
                .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('|');
            const regex = new RegExp(`(${pattern})`, 'gi');
            return content.replace(regex, '<mark class="gov-highlight">$1</mark>');
        },
        exportSelected() {
            console.log('Exporting', this.selectedCases.length, 'cases');
            // Implementation for export functionality
        }
    }
};
</script>

<style scoped>
/* Government Color Palette */
:root {
    --gov-navy: #1B365D;
    --gov-navy-light: #2A4A7C;
    --gov-slate: #64748B;
    --gov-slate-light: #94A3B8;
    --gov-bg: #F8FAFC;
    --gov-border: #E2E8F0;
    --gov-success: #059669;
    --gov-warning: #D97706;
    --gov-danger: #DC2626;
}

.enterprise-search {
    padding: 1.5rem;
    font-family: 'Inter', 'Roboto', system-ui, -apple-system, sans-serif;
    background: var(--gov-bg);
    min-height: 100vh;
}

/* Government Card Styling */
.gov-card {
    background: white;
    border: 1px solid var(--gov-border);
    border-radius: 2px;
    padding: 1.25rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.gov-card-result {
    background: white;
    border: 1px solid var(--gov-border);
    border-radius: 2px;
    padding: 1rem;
    transition: box-shadow 0.2s;
}

.gov-card-result:hover {
    box-shadow: 0 4px 6px rgba(27, 54, 93, 0.1);
}

/* Typography */
.text-gov-navy {
    color: var(--gov-navy);
}

.gov-label {
    display: block;
    margin-bottom: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--gov-slate);
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

/* Buttons */
:deep(.gov-button-primary) {
    background-color: var(--gov-navy) !important;
    border-color: var(--gov-navy) !important;
    border-radius: 2px !important;
    font-weight: 600;
    letter-spacing: 0.025em;
}

:deep(.gov-button-primary:hover) {
    background-color: var(--gov-navy-light) !important;
    border-color: var(--gov-navy-light) !important;
}

:deep(.gov-button-secondary) {
    border-color: var(--gov-slate) !important;
    color: var(--gov-slate) !important;
    border-radius: 2px !important;
    font-weight: 500;
}

:deep(.gov-button-text) {
    color: var(--gov-navy) !important;
    font-weight: 600;
}

/* Inputs */
:deep(.gov-input),
:deep(.gov-select .p-select-label) {
    border-radius: 2px !important;
    border-color: var(--gov-border) !important;
}

:deep(.gov-input:focus),
:deep(.gov-select:focus-within) {
    border-color: var(--gov-navy) !important;
    box-shadow: 0 0 0 2px rgba(27, 54, 93, 0.1) !important;
}

/* Badges */
.gov-badge {
    display: inline-block;
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--gov-slate-light);
    color: white;
    border-radius: 2px;
}

.gov-badge-score {
    display: inline-block;
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
    font-weight: 700;
    background-color: var(--gov-navy);
    color: white;
    border-radius: 2px;
}

.gov-badge-type {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    background-color: #E0E7FF;
    color: #3730A3;
    border-radius: 2px;
}

.gov-badge-outcome {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 2px;
}

.outcome-allowed {
    background-color: #D1FAE5;
    color: var(--gov-success);
}

.outcome-dismissed {
    background-color: #FEE2E2;
    color: var(--gov-danger);
}

.outcome-partial {
    background-color: #FEF3C7;
    color: var(--gov-warning);
}

.outcome-remanded {
    background-color: #E0E7FF;
    color: #4F46E5;
}

/* Status Timeline */
.status-timeline-container {
    margin: 1rem 0;
    padding: 1rem;
    background-color: #F8FAFC;
    border-radius: 2px;
}

.status-steps {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.status-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: var(--gov-slate-light);
    font-size: 0.75rem;
    font-weight: 600;
}

.status-step.active {
    color: var(--gov-navy);
}

.step-circle {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 3px solid var(--gov-slate-light);
    background-color: white;
}

.status-step.active .step-circle {
    border-color: var(--gov-navy);
    background-color: var(--gov-navy);
}

.step-line {
    flex: 1;
    height: 3px;
    background-color: var(--gov-slate-light);
    margin: 0 0.5rem;
}

.step-line.active {
    background-color: var(--gov-navy);
}

/* Metadata Grid */
.metadata-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
    padding: 1rem;
    background-color: #F8FAFC;
    border: 1px solid var(--gov-border);
    border-radius: 2px;
}

.metadata-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.metadata-label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--gov-slate);
}

.metadata-value {
    font-size: 0.875rem;
    color: var(--gov-navy);
}

/* Content Preview */
.content-preview {
    padding: 0.875rem;
    background-color: white;
    border: 1px solid var(--gov-border);
    border-radius: 2px;
    max-height: 120px;
    overflow-y: auto;
    margin: 1rem 0;
}

/* Highlight */
:deep(.gov-highlight) {
    background-color: #FEF08A;
    color: #854D0E;
    font-weight: 700;
    padding: 2px 4px;
    border-radius: 2px;
}

/* Audit Trail */
.audit-trail {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--gov-border);
}

/* Table Styling */
:deep(.gov-table) {
    border-radius: 2px !important;
}

:deep(.gov-table .p-datatable-thead > tr > th) {
    background-color: var(--gov-navy) !important;
    color: white !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.75rem !important;
    padding: 0.875rem !important;
    border: none !important;
}

:deep(.gov-table .p-datatable-tbody > tr) {
    border-bottom: 1px solid var(--gov-border) !important;
}

:deep(.gov-table .p-datatable-tbody > tr:hover) {
    background-color: #F8FAFC !important;
}

/* Panel */
:deep(.gov-panel .p-panel-header) {
    background-color: var(--gov-navy) !important;
    color: white !important;
    border-radius: 2px 2px 0 0 !important;
    font-weight: 600;
}

:deep(.gov-panel .p-panel-content) {
    border-radius: 0 0 2px 2px !important;
}

/* Accessibility - Focus States */
:deep(*:focus) {
    outline: 2px solid var(--gov-navy) !important;
    outline-offset: 2px !important;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
</style>

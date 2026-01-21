<template>
    <div class="search-cases">
        <div class="card">
            <h2 class="text-3xl font-bold mb-6">Case Repository Search</h2>

            <!-- Search Input -->
            <div class="search-container mb-4">
                <div class="flex gap-3">
                    <div class="flex-1">
                        <InputText
                            v-model="searchQuery"
                            placeholder="Search cases... (e.g., 'customs excise', 'limitation period')"
                            class="w-full"
                            @keyup.enter="performSearch"
                        />
                    </div>
                    <Button
                        label="Search"
                        icon="pi pi-search"
                        @click="performSearch"
                        :loading="loading"
                    />
                </div>
            </div>

            <!-- Search Options -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <!-- Search Type -->
                <div>
                    <label class="block mb-2 font-semibold">Search Type</label>
                    <Select
                        v-model="searchType"
                        :options="searchTypes"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                    />
                </div>

                <!-- Result Limit -->
                <div>
                    <label class="block mb-2 font-semibold">Results Limit</label>
                    <InputNumber
                        v-model="resultLimit"
                        :min="1"
                        :max="100"
                        class="w-full"
                    />
                </div>

                <!-- Execution Time -->
                <div v-if="searchResults">
                    <label class="block mb-2 font-semibold">Execution Time</label>
                    <p class="text-lg">{{ searchResults.executionTimeMs }}ms</p>
                </div>
            </div>

            <!-- Weight Sliders (for Hybrid Search) -->
            <div v-if="searchType === 'hybrid'" class="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="text-lg font-semibold mb-4">Search Weights</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block mb-2">Full-Text Weight: {{ ftWeight }}</label>
                        <Slider v-model="ftWeight" :min="0" :max="1" :step="0.1" />
                    </div>
                    <div>
                        <label class="block mb-2">Semantic Weight: {{ semWeight }}</label>
                        <Slider v-model="semWeight" :min="0" :max="1" :step="0.1" />
                    </div>
                </div>
            </div>

            <!-- Search Results -->
            <div v-if="searchResults && searchResults.results.length > 0" class="results-container">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">
                        Found {{ searchResults.totalResults }} results
                    </h3>
                    <Tag :value="searchResults.searchType" severity="info" />
                </div>

                <!-- Results List -->
                <div class="space-y-4">
                    <Card v-for="(result, index) in searchResults.results" :key="index" class="result-card">
                        <template #title>
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="text-lg font-bold">{{ result.caseMetadata.caseNumber }}</h4>
                                    <p class="text-sm text-gray-600">{{ result.documentName }} - Page {{ result.pageNumber }}</p>
                                </div>
                                <div class="flex gap-2">
                                    <Tag :value="`Score: ${result.score.toFixed(3)}`" severity="success" />
                                    <Tag :value="result.matchType" />
                                </div>
                            </div>
                        </template>
                        <template #content>
                            <!-- Case Metadata -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p class="font-semibold">Case Type:</p>
                                    <Tag :value="result.caseMetadata.caseType" />
                                </div>
                                <div>
                                    <p class="font-semibold">Status:</p>
                                    <Tag :value="result.caseMetadata.status" :severity="getStatusSeverity(result.caseMetadata.status)" />
                                </div>
                                <div>
                                    <p class="font-semibold">Appellant:</p>
                                    <p>{{ result.caseMetadata.appellant }}</p>
                                </div>
                                <div>
                                    <p class="font-semibold">Respondent:</p>
                                    <p>{{ result.caseMetadata.respondent }}</p>
                                </div>
                                <div v-if="result.caseMetadata.taxAmountDisputed">
                                    <p class="font-semibold">Tax Amount Disputed:</p>
                                    <p>{{ formatCurrency(result.caseMetadata.taxAmountDisputed) }}</p>
                                </div>
                                <div v-if="result.caseMetadata.outcome">
                                    <p class="font-semibold">Outcome:</p>
                                    <Tag :value="result.caseMetadata.outcome" :severity="getOutcomeSeverity(result.caseMetadata.outcome)" />
                                </div>
                            </div>

                            <!-- Content Snippet -->
                            <div class="content-snippet p-3 bg-gray-50 rounded">
                                <p class="text-sm" v-html="highlightText(result.content)"></p>
                            </div>

                            <!-- Board Members -->
                            <div v-if="result.caseMetadata.chairperson" class="mt-4">
                                <p class="font-semibold">Chairperson: {{ result.caseMetadata.chairperson }}</p>
                                <p v-if="result.caseMetadata.boardMembers" class="text-sm">
                                    Board Members: {{ result.caseMetadata.boardMembers.join(', ') }}
                                </p>
                            </div>

                            <!-- View Details Button -->
                            <div class="mt-4">
                                <Button
                                    label="View Full Case Details"
                                    icon="pi pi-eye"
                                    size="small"
                                    @click="viewCaseDetails(result.caseId)"
                                />
                            </div>
                        </template>
                    </Card>
                </div>
            </div>

            <!-- No Results -->
            <div v-else-if="searchResults && searchResults.results.length === 0" class="text-center py-8">
                <i class="pi pi-search text-6xl text-gray-300"></i>
                <p class="text-xl text-gray-500 mt-4">No results found for "{{ searchQuery }}"</p>
            </div>

            <!-- Error Message -->
            <Message v-if="errorMessage" severity="error" :closable="true" @close="errorMessage = null">
                {{ errorMessage }}
            </Message>
        </div>
    </div>
</template>

<script>
import SearchService from '@/service/SearchService';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Message from 'primevue/message';

import Panel from 'primevue/panel';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

export default {
    name: 'SearchCases',
    components: {
        InputText,
        Button,
        Select,
        InputNumber,
        Slider,
        Card,
        Tag,
        Message,
        Panel
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
            resultLimit: 10,
            ftWeight: 0.5,
            semWeight: 0.5,
            searchResults: null,
            loading: false,
            errorMessage: null
        };
    },
    methods: {
        async performSearch() {
            if (!this.searchQuery.trim()) {
                this.errorMessage = 'Please enter a search query';
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
        viewCaseDetails(caseId) {
            this.$router.push({ name: 'CaseDetails', params: { id: caseId } });
        },
        highlightText(content) {
            if (!this.searchQuery || !content) return content;

            // Split search query into individual words
            const searchTerms = this.searchQuery.trim().split(/\s+/);

            // Create a regex pattern that matches any of the search terms (case-insensitive)
            const pattern = searchTerms
                .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex chars
                .join('|');

            const regex = new RegExp(`(${pattern})`, 'gi');

            // Replace matched terms with highlighted version
            return content.replace(regex, '<span class="highlight">$1</span>');
        }
    }
};
</script>

<style scoped>
/* Government Enterprise Styling */
.search-cases {
    padding: 1.5rem;
    font-family: 'Inter', 'Roboto', system-ui, sans-serif;
}

/* Cards with government styling */
:deep(.card) {
    border-radius: 2px !important;
    border: 1px solid #E2E8F0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.result-card {
    transition: all 0.2s;
    border-radius: 2px !important;
}

.result-card:hover {
    box-shadow: 0 4px 6px rgba(27, 54, 93, 0.1);
}

/* Government Blue Buttons */
:deep(.p-button) {
    border-radius: 2px !important;
    font-weight: 600;
    letter-spacing: 0.025em;
}

:deep(.p-button:not(.p-button-outlined)) {
    background-color: #1B365D !important;
    border-color: #1B365D !important;
}

:deep(.p-button:not(.p-button-outlined):hover) {
    background-color: #2A4A7C !important;
    border-color: #2A4A7C !important;
}

/* Input styling */
:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-inputnumber-input) {
    border-radius: 2px !important;
    border-color: #E2E8F0 !important;
}

:deep(.p-inputtext:focus),
:deep(.p-select:focus-within),
:deep(.p-inputnumber:focus-within) {
    border-color: #1B365D !important;
    box-shadow: 0 0 0 2px rgba(27, 54, 93, 0.1) !important;
}

/* Tags with better government colors */
:deep(.p-tag) {
    border-radius: 2px !important;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.75rem;
}

:deep(.p-tag.p-tag-success) {
    background-color: #D1FAE5 !important;
    color: #059669 !important;
}

:deep(.p-tag.p-tag-danger) {
    background-color: #FEE2E2 !important;
    color: #DC2626 !important;
}

:deep(.p-tag.p-tag-warn) {
    background-color: #FEF3C7 !important;
    color: #D97706 !important;
}

:deep(.p-tag.p-tag-info) {
    background-color: #E0E7FF !important;
    color: #4F46E5 !important;
}

.content-snippet {
    max-height: 150px;
    overflow-y: auto;
    border-radius: 2px;
}

.highlight {
    background-color: #FEF08A;
    color: #854D0E;
    font-weight: 700;
    padding: 2px 4px;
    border-radius: 2px;
}

/* Headers */
h2, h3, h4 {
    color: #1B365D;
}

/* Labels */
label {
    color: #64748B;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    font-size: 0.875rem;
}

/* Focus states for accessibility */
:deep(*:focus) {
    outline: 2px solid #1B365D !important;
    outline-offset: 2px !important;
}
</style>

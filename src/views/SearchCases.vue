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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

            <!-- Advanced Filters Toggle -->
            <div class="mb-6">
                <Button
                    :label="showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'"
                    :icon="showAdvancedFilters ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
                    @click="showAdvancedFilters = !showAdvancedFilters"
                    outlined
                    size="small"
                    class="mb-3"
                />

                <!-- Advanced Filters Panel -->
                <Panel v-if="showAdvancedFilters" header="Advanced Filters" :toggleable="false" class="advanced-filters-panel">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <!-- Tax Type Filter -->
                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="pi pi-folder"></i>
                                Tax Type
                            </label>
                            <Select
                                v-model="filters.taxType"
                                :options="taxTypes"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="All Tax Types"
                                class="w-full"
                                :showClear="true"
                            />
                        </div>

                        <!-- Outcome Filter -->
                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="pi pi-check-circle"></i>
                                Outcome
                            </label>
                            <Select
                                v-model="filters.outcome"
                                :options="outcomes"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="All Outcomes"
                                class="w-full"
                                :showClear="true"
                            />
                        </div>

                        <!-- Chairperson Filter -->
                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="pi pi-user"></i>
                                Chairperson
                            </label>
                            <Select
                                v-model="filters.chairperson"
                                :options="chairpersons"
                                placeholder="All Chairpersons"
                                class="w-full"
                                :showClear="true"
                                :loading="loadingChairpersons"
                                filter
                            />
                        </div>
                    </div>

                    <!-- Date Range Filters -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="pi pi-calendar"></i>
                                Decision Date From
                            </label>
                            <DatePicker
                                v-model="filters.decisionDateFrom"
                                placeholder="Select start date"
                                dateFormat="yy-mm-dd"
                                class="w-full"
                                :showClear="true"
                            />
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="pi pi-calendar"></i>
                                Decision Date To
                            </label>
                            <DatePicker
                                v-model="filters.decisionDateTo"
                                placeholder="Select end date"
                                dateFormat="yy-mm-dd"
                                class="w-full"
                                :showClear="true"
                            />
                        </div>

                        <div class="filter-group">
                            <label class="filter-label">
                                <i class="pi pi-money-bill"></i>
                                Min Amount Disputed (TZS)
                            </label>
                            <InputNumber
                                v-model="filters.minAmountDisputed"
                                placeholder="e.g., 1000000"
                                class="w-full"
                                :min="0"
                                mode="currency"
                                currency="TZS"
                                locale="en-TZ"
                            />
                        </div>
                    </div>

                    <!-- Filter Actions -->
                    <div class="flex gap-3 mt-4">
                        <Button
                            label="Apply Filters"
                            icon="pi pi-filter"
                            @click="applyFilters"
                            size="small"
                        />
                        <Button
                            label="Clear All Filters"
                            icon="pi pi-times"
                            @click="clearFilters"
                            outlined
                            severity="secondary"
                            size="small"
                        />
                        <Tag v-if="activeFiltersCount > 0" :value="`${activeFiltersCount} filter(s) active`" severity="info" />
                    </div>
                </Panel>
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
            <div v-if="filteredResults && filteredResults.results.length > 0" class="results-container">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="text-xl font-semibold">
                            Found {{ filteredResults.totalResults }} results
                            <span v-if="activeFiltersCount > 0" class="text-sm text-gray-500 ml-2">
                                ({{ searchResults.totalResults }} total, filtered to {{ filteredResults.totalResults }})
                            </span>
                        </h3>
                    </div>
                    <div class="flex gap-2 items-center">
                        <Tag :value="filteredResults.searchType" severity="info" />
                        <Button
                            icon="pi pi-file-excel"
                            label="Export to Excel"
                            severity="success"
                            outlined
                            size="small"
                            @click="exportToExcel"
                            v-tooltip.top="'Export search results to Excel'"
                        />
                        <Button
                            icon="pi pi-download"
                            label="Export to CSV"
                            severity="secondary"
                            outlined
                            size="small"
                            @click="exportToCSV"
                            v-tooltip.top="'Export search results to CSV'"
                        />
                    </div>
                </div>

                <!-- Results List -->
                <div class="space-y-4">
                    <Card v-for="(result, index) in filteredResults.results" :key="index" class="result-card">
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
                                    <Tag :severity="getOutcomeSeverity(result.caseMetadata.outcome)" class="outcome-tag">
                                        <i :class="getOutcomeIcon(result.caseMetadata.outcome)" class="mr-2"></i>
                                        {{ result.caseMetadata.outcome.replace('_', ' ').toUpperCase() }}
                                    </Tag>
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
            <div v-else-if="(filteredResults && filteredResults.results.length === 0) || (searchResults && searchResults.results.length === 0)" class="text-center py-8">
                <i class="pi pi-search text-6xl text-gray-300"></i>
                <p v-if="activeFiltersCount > 0 && searchResults && searchResults.results.length > 0" class="text-xl text-gray-500 mt-4">
                    No results match your filters. Try adjusting or clearing the filters.
                </p>
                <p v-else class="text-xl text-gray-500 mt-4">No results found for "{{ searchQuery }}"</p>
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
import CaseService from '@/service/CaseService';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import Panel from 'primevue/panel';
import DatePicker from 'primevue/datepicker';
import * as XLSX from 'xlsx';

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
        Panel,
        DatePicker
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
            errorMessage: null,
            showAdvancedFilters: false,
            filters: {
                taxType: null,
                outcome: null,
                chairperson: null,
                decisionDateFrom: null,
                decisionDateTo: null,
                minAmountDisputed: null
            },
            taxTypes: [
                { label: 'Income Tax', value: 'income_tax' },
                { label: 'VAT', value: 'vat' },
                { label: 'Customs', value: 'customs' },
                { label: 'Excise', value: 'excise' },
                { label: 'Stamp Duty', value: 'stamp_duty' },
                { label: 'Other', value: 'other' }
            ],
            outcomes: [
                { label: 'Allowed', value: 'allowed' },
                { label: 'Dismissed', value: 'dismissed' },
                { label: 'Partially Allowed', value: 'partially_allowed' },
                { label: 'Remanded', value: 'remanded' },
                { label: 'Other', value: 'other' }
            ],
            chairpersons: [],
            loadingChairpersons: false
        };
    },
    mounted() {
        this.loadChairpersons();
    },
    computed: {
        activeFiltersCount() {
            let count = 0;
            if (this.filters.taxType) count++;
            if (this.filters.outcome) count++;
            if (this.filters.chairperson) count++;
            if (this.filters.decisionDateFrom) count++;
            if (this.filters.decisionDateTo) count++;
            if (this.filters.minAmountDisputed && this.filters.minAmountDisputed > 0) count++;
            return count;
        },
        filteredResults() {
            if (!this.searchResults || !this.searchResults.results) return null;

            let filtered = [...this.searchResults.results];

            // Apply client-side filters
            if (this.filters.taxType) {
                filtered = filtered.filter(r => r.caseMetadata.caseType === this.filters.taxType);
            }

            if (this.filters.outcome) {
                filtered = filtered.filter(r => r.caseMetadata.outcome === this.filters.outcome);
            }

            if (this.filters.chairperson) {
                filtered = filtered.filter(r => r.caseMetadata.chairperson === this.filters.chairperson);
            }

            if (this.filters.decisionDateFrom) {
                const fromDate = new Date(this.filters.decisionDateFrom);
                filtered = filtered.filter(r =>
                    r.caseMetadata.decisionDate &&
                    new Date(r.caseMetadata.decisionDate) >= fromDate
                );
            }

            if (this.filters.decisionDateTo) {
                const toDate = new Date(this.filters.decisionDateTo);
                filtered = filtered.filter(r =>
                    r.caseMetadata.decisionDate &&
                    new Date(r.caseMetadata.decisionDate) <= toDate
                );
            }

            if (this.filters.minAmountDisputed && this.filters.minAmountDisputed > 0) {
                filtered = filtered.filter(r =>
                    r.caseMetadata.taxAmountDisputed &&
                    r.caseMetadata.taxAmountDisputed >= this.filters.minAmountDisputed
                );
            }

            return {
                ...this.searchResults,
                results: filtered,
                totalResults: filtered.length
            };
        }
    },
    methods: {
        async loadChairpersons() {
            this.loadingChairpersons = true;
            try {
                const chairpersonsList = await CaseService.getChairpersons();
                this.chairpersons = chairpersonsList;
            } catch (error) {
                console.error('Error loading chairpersons:', error);
                this.chairpersons = [];
            } finally {
                this.loadingChairpersons = false;
            }
        },
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
        getOutcomeIcon(outcome) {
            const iconMap = {
                'allowed': 'pi pi-check-circle',
                'dismissed': 'pi pi-times-circle',
                'partially_allowed': 'pi pi-exclamation-circle',
                'remanded': 'pi pi-replay'
            };
            return iconMap[outcome] || 'pi pi-info-circle';
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
        },
        applyFilters() {
            // Filters are applied automatically via the filteredResults computed property
            // This method can be used for additional actions like analytics or notifications
            if (this.activeFiltersCount > 0) {
                this.$toast?.add({
                    severity: 'info',
                    summary: 'Filters Applied',
                    detail: `${this.activeFiltersCount} filter(s) active`,
                    life: 2000
                });
            }
        },
        clearFilters() {
            this.filters = {
                taxType: null,
                outcome: null,
                chairperson: null,
                decisionDateFrom: null,
                decisionDateTo: null,
                minAmountDisputed: null
            };
            this.$toast?.add({
                severity: 'success',
                summary: 'Filters Cleared',
                detail: 'All filters have been reset',
                life: 2000
            });
        },
        exportToExcel() {
            if (!this.filteredResults || this.filteredResults.results.length === 0) {
                this.$toast?.add({
                    severity: 'warn',
                    summary: 'No Data',
                    detail: 'No search results to export',
                    life: 3000
                });
                return;
            }

            // Prepare data for export
            const exportData = this.filteredResults.results.map((result, index) => ({
                'No.': index + 1,
                'Case Number': result.caseMetadata.caseNumber || 'N/A',
                'Case Type': result.caseMetadata.caseType || 'N/A',
                'Appellant': result.caseMetadata.appellant || 'N/A',
                'Respondent': result.caseMetadata.respondent || 'N/A',
                'Status': result.caseMetadata.status || 'N/A',
                'Outcome': result.caseMetadata.outcome || 'N/A',
                'Tax Amount Disputed (TZS)': result.caseMetadata.taxAmountDisputed || 0,
                'Chairperson': result.caseMetadata.chairperson || 'N/A',
                'Decision Date': result.caseMetadata.decisionDate || 'N/A',
                'Match Type': result.matchType || 'N/A',
                'Score': result.score?.toFixed(3) || 'N/A',
                'Document': result.documentName || 'N/A',
                'Page': result.pageNumber || 'N/A'
            }));

            // Create workbook and worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Search Results');

            // Auto-size columns
            const maxWidth = 50;
            const wscols = Object.keys(exportData[0]).map(key => ({
                wch: Math.min(Math.max(key.length, 10), maxWidth)
            }));
            ws['!cols'] = wscols;

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `TRAB_Search_Results_${timestamp}.xlsx`;

            // Download file
            XLSX.writeFile(wb, filename);

            this.$toast?.add({
                severity: 'success',
                summary: 'Export Successful',
                detail: `Exported ${this.filteredResults.results.length} results to Excel`,
                life: 3000
            });
        },
        exportToCSV() {
            if (!this.filteredResults || this.filteredResults.results.length === 0) {
                this.$toast?.add({
                    severity: 'warn',
                    summary: 'No Data',
                    detail: 'No search results to export',
                    life: 3000
                });
                return;
            }

            // Prepare CSV data
            const headers = [
                'No.',
                'Case Number',
                'Case Type',
                'Appellant',
                'Respondent',
                'Status',
                'Outcome',
                'Tax Amount Disputed (TZS)',
                'Chairperson',
                'Decision Date',
                'Match Type',
                'Score',
                'Document',
                'Page'
            ];

            const rows = this.filteredResults.results.map((result, index) => [
                index + 1,
                result.caseMetadata.caseNumber || 'N/A',
                result.caseMetadata.caseType || 'N/A',
                result.caseMetadata.appellant || 'N/A',
                result.caseMetadata.respondent || 'N/A',
                result.caseMetadata.status || 'N/A',
                result.caseMetadata.outcome || 'N/A',
                result.caseMetadata.taxAmountDisputed || 0,
                result.caseMetadata.chairperson || 'N/A',
                result.caseMetadata.decisionDate || 'N/A',
                result.matchType || 'N/A',
                result.score?.toFixed(3) || 'N/A',
                result.documentName || 'N/A',
                result.pageNumber || 'N/A'
            ]);

            // Convert to CSV string
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `TRAB_Search_Results_${timestamp}.csv`;

            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.$toast?.add({
                severity: 'success',
                summary: 'Export Successful',
                detail: `Exported ${this.filteredResults.results.length} results to CSV`,
                life: 3000
            });
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

/* Select dropdown improvements */
:deep(.p-select .p-select-label) {
    padding: 0.625rem 0.75rem;
    font-weight: 500;
    color: #1e293b;
}

:deep(.p-select.p-variant-filled .p-select-label) {
    background-color: #F8FAFC;
}

:deep(.p-select-option) {
    padding: 0.625rem 1rem;
    border-radius: 2px;
    margin: 2px 4px;
}

:deep(.p-select-option:hover) {
    background-color: #F1F5F9;
    color: #1B365D;
}

:deep(.p-select-option.p-focus) {
    background-color: #E0E7FF;
    color: #1B365D;
}

:deep(.p-select-option.p-selected) {
    background-color: #1B365D;
    color: #FFFFFF;
    font-weight: 600;
}

:deep(.p-select-overlay) {
    border-radius: 2px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

:deep(.p-select-filter-container) {
    padding: 0.5rem;
    border-bottom: 1px solid #E2E8F0;
}

:deep(.p-select-filter) {
    border-radius: 2px;
    border-color: #E2E8F0;
}

:deep(.p-select-filter:focus) {
    border-color: #1B365D;
    box-shadow: 0 0 0 2px rgba(27, 54, 93, 0.1);
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

/* Advanced Filters Panel */
.advanced-filters-panel {
    background: #F8FAFC;
    border-radius: 2px;
    border: 1px solid #E2E8F0;
}

:deep(.advanced-filters-panel .p-panel-header) {
    background-color: #1B365D;
    color: #FFFFFF;
    border-radius: 2px 2px 0 0;
    padding: 0.75rem 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.875rem;
}

:deep(.advanced-filters-panel .p-panel-content) {
    padding: 1.25rem;
    background: #FFFFFF;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-label {
    color: #475569;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.filter-label i {
    color: #1B365D;
    font-size: 0.875rem;
}

/* Enhanced Outcome Tags */
.outcome-tag {
    font-size: 0.875rem !important;
    padding: 0.5rem 1rem !important;
    font-weight: 700 !important;
    display: inline-flex !important;
    align-items: center !important;
}

.outcome-tag i {
    font-size: 1rem;
}
</style>

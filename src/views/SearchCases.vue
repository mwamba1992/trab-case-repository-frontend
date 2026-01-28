<template>
    <div class="search-cases">
        <div class="card">
            <h2 class="text-3xl font-bold mb-6">Case Repository Search</h2>

            <!-- Quick Filter Chips -->
            <div class="quick-filters-section mb-4">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="quick-filters-label">Quick Searches:</span>
                    <Chip
                        v-for="quickFilter in quickFilters"
                        :key="quickFilter.id"
                        :label="quickFilter.label"
                        :icon="quickFilter.icon"
                        class="quick-filter-chip"
                        @click="applyQuickFilter(quickFilter)"
                    />
                </div>
            </div>

            <!-- Search Input with History -->
            <div class="search-container mb-4">
                <div class="flex gap-3">
                    <div class="flex-1 relative">
                        <InputText
                            v-model="searchQuery"
                            placeholder="Search cases... (e.g., 'customs excise', 'limitation period')"
                            class="w-full"
                            @keyup.enter="performSearch"
                            @focus="showSearchHistory = true"
                        />
                        <!-- Search History Dropdown -->
                        <div v-if="showSearchHistory && searchHistory.length > 0" class="search-history-dropdown">
                            <div class="search-history-header">
                                <span class="text-xs font-bold text-gray-600 uppercase">Recent Searches</span>
                                <Button
                                    icon="pi pi-trash"
                                    text
                                    rounded
                                    size="small"
                                    severity="danger"
                                    @click="clearSearchHistory"
                                    v-tooltip.top="'Clear History'"
                                />
                            </div>
                            <div class="search-history-items">
                                <div
                                    v-for="(historyItem, index) in searchHistory.slice(0, 8)"
                                    :key="index"
                                    class="search-history-item"
                                    @click="loadSearchFromHistory(historyItem)"
                                >
                                    <div class="flex items-center gap-2 flex-1">
                                        <i class="pi pi-history text-gray-400"></i>
                                        <div class="flex-1">
                                            <p class="font-semibold text-sm">{{ historyItem.query }}</p>
                                            <p class="text-xs text-gray-500">
                                                {{ historyItem.searchType }} • {{ historyItem.resultCount }} results • {{ formatHistoryDate(historyItem.timestamp) }}
                                            </p>
                                        </div>
                                    </div>
                                    <i class="pi pi-arrow-right text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        label="Search"
                        icon="pi pi-search"
                        @click="performSearch"
                        :loading="loading"
                    />
                    <Button
                        icon="pi pi-clock"
                        outlined
                        @click="toggleHistoryPanel"
                        v-tooltip.top="'View Search History'"
                        :badge="searchHistory.length > 0 ? searchHistory.length.toString() : null"
                        badgeSeverity="info"
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

                            <!-- Content Snippet with Enhanced Highlighting -->
                            <div class="content-snippet-container">
                                <div class="content-snippet-header">
                                    <span class="snippet-label">
                                        <i class="pi pi-file-edit"></i>
                                        Text Match (Page {{ result.pageNumber }})
                                    </span>
                                    <span v-if="getMatchCount(result.content) > 0" class="match-count">
                                        <i class="pi pi-search"></i>
                                        {{ getMatchCount(result.content) }} match{{ getMatchCount(result.content) > 1 ? 'es' : '' }}
                                    </span>
                                </div>
                                <div class="content-snippet p-3 bg-gray-50 rounded">
                                    <div class="text-sm content-text" v-html="highlightText(result.content)"></div>
                                </div>
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
            loadingChairpersons: false,
            searchHistory: [],
            showSearchHistory: false,
            showHistoryPanel: false,
            quickFilters: [
                {
                    id: 'high-value',
                    label: 'High Value Cases (>50M)',
                    icon: 'pi pi-money-bill',
                    query: 'tax liability assessment',
                    filters: { minAmountDisputed: 50000000 }
                },
                {
                    id: 'allowed-cases',
                    label: 'Allowed Appeals',
                    icon: 'pi pi-check-circle',
                    query: 'appeal allowed',
                    filters: { outcome: 'allowed' }
                },
                {
                    id: 'vat-cases',
                    label: 'VAT Cases',
                    icon: 'pi pi-percentage',
                    query: 'value added tax VAT',
                    filters: { taxType: 'vat' }
                },
                {
                    id: 'customs-cases',
                    label: 'Customs Cases',
                    icon: 'pi pi-globe',
                    query: 'customs duty import export',
                    filters: { taxType: 'customs' }
                },
                {
                    id: 'limitation-period',
                    label: 'Limitation Period',
                    icon: 'pi pi-clock',
                    query: 'limitation period time barred statute of limitations',
                    filters: {}
                },
                {
                    id: 'procedural-issues',
                    label: 'Procedural Issues',
                    icon: 'pi pi-list',
                    query: 'procedure notice service jurisdiction',
                    filters: {}
                },
                {
                    id: 'recent-decisions',
                    label: 'Recent Decisions (2024)',
                    icon: 'pi pi-calendar',
                    query: 'decision',
                    filters: {
                        decisionDateFrom: new Date('2024-01-01'),
                        decisionDateTo: new Date('2024-12-31')
                    }
                }
            ]
        };
    },
    mounted() {
        this.loadChairpersons();
        this.loadSearchHistory();
        // Close search history dropdown when clicking outside
        document.addEventListener('click', this.handleClickOutside);
        // Check for query parameters from similar cases navigation
        this.loadFromQueryParams();
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
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
                // Save to search history
                this.saveToSearchHistory(this.searchQuery, this.searchType, results.totalResults);
            } catch (error) {
                this.errorMessage = error.response?.data?.message || 'An error occurred while searching';
            } finally {
                this.loading = false;
                this.showSearchHistory = false;
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

            try {
                // Split search query into individual words
                const searchTerms = this.searchQuery.trim().split(/\s+/);

                // Expand search terms to include variations (singular/plural, with/without 's')
                const expandedTerms = [];
                searchTerms.forEach(term => {
                    // Escape special regex chars
                    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                    // Add the original term
                    expandedTerms.push(escapedTerm);

                    // Add variations for common word endings
                    // If term ends with 's', add version without 's'
                    if (term.toLowerCase().endsWith('s') && term.length > 2) {
                        expandedTerms.push(escapedTerm.slice(0, -1));
                    } else {
                        // If term doesn't end with 's', add version with 's'
                        expandedTerms.push(escapedTerm + 's?'); // Optional 's'
                    }

                    // Add variations for -ed, -ing endings
                    if (term.length > 3) {
                        const base = escapedTerm.replace(/e?d$/i, '').replace(/ing$/i, '');
                        if (base !== escapedTerm) {
                            expandedTerms.push(base + '(s|ed|ing)?');
                        }
                    }
                });

                // Create a regex pattern that matches any of the search terms and variations
                const pattern = [...new Set(expandedTerms)].join('|');
                const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

                // Debug logging
                if (content.toLowerCase().includes('appeal')) {
                    console.log('Highlighting debug:', {
                        searchQuery: this.searchQuery,
                        pattern: pattern,
                        contentPreview: content.substring(0, 100),
                        matches: content.match(regex)
                    });
                }

                // Replace matched terms with highlighted version with animation and inline styles
                // Using bright yellow-orange background with dark text for maximum visibility
                const highlighted = content.replace(regex, '<span class="highlight animate-pulse-highlight" style="background: #FFEB3B; background-image: linear-gradient(135deg, #FFEB3B 0%, #FFC107 100%); color: #000000; font-weight: 900; padding: 3px 6px; border-radius: 4px; border: 2px solid #FF9800; box-shadow: 0 0 8px rgba(255, 152, 0, 0.4);">$1</span>');
                return highlighted;
            } catch (error) {
                console.error('Highlighting error:', error);
                return content;
            }
        },
        getMatchCount(content) {
            if (!this.searchQuery || !content) return 0;

            // Split search query into individual words
            const searchTerms = this.searchQuery.trim().split(/\s+/);

            // Expand search terms to include variations (same logic as highlightText)
            const expandedTerms = [];
            searchTerms.forEach(term => {
                const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                expandedTerms.push(escapedTerm);

                if (term.toLowerCase().endsWith('s') && term.length > 2) {
                    expandedTerms.push(escapedTerm.slice(0, -1));
                } else {
                    expandedTerms.push(escapedTerm + 's?');
                }

                if (term.length > 3) {
                    const base = escapedTerm.replace(/e?d$/i, '').replace(/ing$/i, '');
                    if (base !== escapedTerm) {
                        expandedTerms.push(base + '(s|ed|ing)?');
                    }
                }
            });

            const pattern = [...new Set(expandedTerms)].join('|');
            const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

            // Count all matches
            const matches = content.match(regex);
            return matches ? matches.length : 0;
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
        },
        // Search History Methods
        loadSearchHistory() {
            try {
                const history = localStorage.getItem('trab_search_history');
                if (history) {
                    this.searchHistory = JSON.parse(history);
                }
            } catch (error) {
                console.error('Error loading search history:', error);
                this.searchHistory = [];
            }
        },
        saveToSearchHistory(query, searchType, resultCount) {
            try {
                // Check if this exact query already exists
                const existingIndex = this.searchHistory.findIndex(
                    item => item.query.toLowerCase() === query.toLowerCase() && item.searchType === searchType
                );

                const historyItem = {
                    query,
                    searchType,
                    resultCount,
                    timestamp: new Date().toISOString()
                };

                // If exists, remove it (we'll add it to the top)
                if (existingIndex !== -1) {
                    this.searchHistory.splice(existingIndex, 1);
                }

                // Add to beginning of array
                this.searchHistory.unshift(historyItem);

                // Keep only last 50 searches
                if (this.searchHistory.length > 50) {
                    this.searchHistory = this.searchHistory.slice(0, 50);
                }

                // Save to localStorage
                localStorage.setItem('trab_search_history', JSON.stringify(this.searchHistory));
            } catch (error) {
                console.error('Error saving search history:', error);
            }
        },
        loadSearchFromHistory(historyItem) {
            this.searchQuery = historyItem.query;
            this.searchType = historyItem.searchType;
            this.showSearchHistory = false;
            this.performSearch();
        },
        clearSearchHistory() {
            this.searchHistory = [];
            localStorage.removeItem('trab_search_history');
            this.showSearchHistory = false;
            this.$toast?.add({
                severity: 'success',
                summary: 'History Cleared',
                detail: 'Search history has been cleared',
                life: 2000
            });
        },
        toggleHistoryPanel() {
            this.showHistoryPanel = !this.showHistoryPanel;
        },
        formatHistoryDate(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString();
        },
        handleClickOutside(event) {
            const searchContainer = this.$el.querySelector('.search-container');
            if (searchContainer && !searchContainer.contains(event.target)) {
                this.showSearchHistory = false;
            }
        },
        loadFromQueryParams() {
            // Load search parameters from URL (e.g., from "Find Similar Cases")
            const urlParams = this.$route.query;

            if (urlParams.q) {
                this.searchQuery = urlParams.q;

                // Apply filters if provided
                if (urlParams.taxType) {
                    this.filters.taxType = urlParams.taxType;
                }
                if (urlParams.outcome) {
                    this.filters.outcome = urlParams.outcome;
                }
                if (urlParams.chairperson) {
                    this.filters.chairperson = urlParams.chairperson;
                }

                // Auto-run search if query is present
                this.$nextTick(() => {
                    this.performSearch();
                    if (this.filters.taxType || this.filters.outcome || this.filters.chairperson) {
                        this.showAdvancedFilters = true;
                    }
                });
            }
        },
        applyQuickFilter(quickFilter) {
            // Apply the pre-configured search query
            this.searchQuery = quickFilter.query;

            // Apply associated filters
            if (quickFilter.filters) {
                Object.keys(quickFilter.filters).forEach(key => {
                    this.filters[key] = quickFilter.filters[key];
                });
            }

            // Show advanced filters if any filters were applied
            if (Object.keys(quickFilter.filters).length > 0) {
                this.showAdvancedFilters = true;
            }

            // Execute the search
            this.performSearch();

            // Show toast notification
            this.$toast?.add({
                severity: 'info',
                summary: 'Quick Filter Applied',
                detail: `Searching for: ${quickFilter.label}`,
                life: 2000
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

/* Content Snippet with Enhanced Highlighting */
.content-snippet-container {
    margin-top: 1rem;
    border: 1px solid #E2E8F0;
    border-radius: 2px;
    overflow: hidden;
}

.content-snippet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.625rem 0.875rem;
    background: linear-gradient(135deg, #1B365D 0%, #2A4A7C 100%);
    color: #FFFFFF;
    font-size: 0.8125rem;
}

.snippet-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
}

.snippet-label i {
    color: #D4AF37;
}

.match-count {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    background: rgba(212, 175, 55, 0.2);
    padding: 0.25rem 0.625rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 700;
}

.match-count i {
    color: #D4AF37;
    font-size: 0.7rem;
}

.content-snippet {
    max-height: 180px;
    overflow-y: auto;
    border-radius: 0;
    line-height: 1.6;
}

.content-snippet::-webkit-scrollbar {
    width: 6px;
}

.content-snippet::-webkit-scrollbar-track {
    background: #F1F5F9;
}

.content-snippet::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 3px;
}

.content-snippet::-webkit-scrollbar-thumb:hover {
    background: #94A3B8;
}

.content-text {
    color: #334155;
    word-wrap: break-word;
}

/* Force highlight styles with maximum specificity */
.content-snippet .content-text .highlight,
.content-text .highlight,
span.highlight {
    background: #FFEB3B !important;
    background-image: linear-gradient(135deg, #FFEB3B 0%, #FFC107 100%) !important;
    color: #000000 !important;
    font-weight: 900 !important;
    padding: 3px 6px !important;
    border-radius: 4px !important;
    box-shadow: 0 0 8px rgba(255, 152, 0, 0.4) !important;
    border: 2px solid #FF9800 !important;
    position: relative !important;
    display: inline !important;
    text-decoration: none !important;
}

.content-snippet .content-text .animate-pulse-highlight,
.content-text .animate-pulse-highlight,
span.animate-pulse-highlight {
    animation: pulse-highlight 2s ease-in-out !important;
}

@keyframes pulse-highlight {
    0%, 100% {
        box-shadow: 0 0 0 2px rgba(234, 179, 8, 0.2);
    }
    50% {
        box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.4);
    }
}

.animate-pulse-highlight {
    animation: pulse-highlight 2s ease-in-out;
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

/* Search History Dropdown */
.search-history-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.5rem;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 2px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    z-index: 1000;
    max-height: 400px;
    overflow-y: auto;
}

.search-history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #E2E8F0;
    background-color: #F8FAFC;
}

.search-history-items {
    max-height: 350px;
    overflow-y: auto;
}

.search-history-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #F1F5F9;
    cursor: pointer;
    transition: all 0.15s;
}

.search-history-item:hover {
    background-color: #F8FAFC;
    border-left: 3px solid #1B365D;
}

.search-history-item:last-child {
    border-bottom: none;
}

.search-history-item i.pi-history {
    font-size: 1.25rem;
}

.search-history-item i.pi-arrow-right {
    font-size: 0.875rem;
    opacity: 0;
    transition: opacity 0.15s;
}

.search-history-item:hover i.pi-arrow-right {
    opacity: 1;
}

/* Quick Filter Chips */
.quick-filters-section {
    background: #F8FAFC;
    padding: 1rem 1.25rem;
    border-radius: 2px;
    border: 1px solid #E2E8F0;
}

.quick-filters-label {
    font-size: 0.875rem;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.quick-filter-chip {
    cursor: pointer !important;
    transition: all 0.2s;
    background: #FFFFFF !important;
    border: 1px solid #CBD5E1 !important;
    padding: 0.5rem 0.875rem !important;
    font-weight: 600 !important;
    font-size: 0.8125rem !important;
    color: #1B365D !important;
}

.quick-filter-chip:hover {
    background: #1B365D !important;
    color: #FFFFFF !important;
    border-color: #1B365D !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(27, 54, 93, 0.15);
}

.quick-filter-chip :deep(.p-chip-icon) {
    color: #1B365D;
    margin-right: 0.5rem;
}

.quick-filter-chip:hover :deep(.p-chip-icon) {
    color: #D4AF37;
}
</style>

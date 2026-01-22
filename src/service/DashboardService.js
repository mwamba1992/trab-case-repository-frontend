import axios from 'axios';
import { Config } from '@/utils/Config';

const API_URL = `${Config.API_BASE_URL}/cases`;

class DashboardService {
    /**
     * Get dashboard statistics from the cases endpoint
     * Counts all cases from /api/v1/cases
     */
    async getDashboardStats() {
        try {
            // First, try to get stats from stats endpoint
            let statsData;
            try {
                const statsResponse = await axios.get(`${API_URL}/stats`);
                statsData = await this.transformStatsData(statsResponse.data);
            } catch (statsError) {
                console.log('Stats endpoint unavailable, counting from cases endpoint');
                statsData = {};
            }

            // Always count total cases from /api/v1/cases endpoint
            const casesResponse = await axios.get(API_URL, {
                params: { limit: 10000 } // Get all cases
            });

            const cases = casesResponse.data.cases || casesResponse.data || [];
            const totalCasesCount = Array.isArray(cases) ? cases.length : (casesResponse.data.total || 0);

            // Update total cases with actual count from cases endpoint
            statsData.totalCases = totalCasesCount;

            // Count outcomes from the cases (this is a decision portal - all cases are decided)
            if (Array.isArray(cases)) {
                const outcomes = {
                    allowed: 0,
                    dismissed: 0,
                    partially_allowed: 0,
                    remanded: 0
                };

                cases.forEach(caseItem => {
                    const outcome = (caseItem.outcome || '').toLowerCase().replace(/\s+/g, '_');
                    if (outcome === 'allowed') {
                        outcomes.allowed++;
                    } else if (outcome === 'dismissed') {
                        outcomes.dismissed++;
                    } else if (outcome === 'partially_allowed' || outcome === 'partial') {
                        outcomes.partially_allowed++;
                    } else if (outcome === 'remanded') {
                        outcomes.remanded++;
                    }
                });

                statsData.allowedCases = outcomes.allowed;
                statsData.dismissedCases = outcomes.dismissed;
                statsData.partiallyAllowedCases = outcomes.partially_allowed;
                statsData.remandedCases = outcomes.remanded;
            }

            // If average resolution days is 0 or not provided, calculate it from cases
            if (!statsData.averageResolutionDays || statsData.averageResolutionDays === 0) {
                const avgDays = await this.calculateAverageResolutionDays();
                statsData.averageResolutionDays = avgDays;
            }

            // Ensure we have required fields
            statsData.appealedCases = statsData.appealedCases || 0;
            statsData.totalTaxDisputed = statsData.totalTaxDisputed || 0;
            statsData.totalTaxRecovered = statsData.totalTaxRecovered || 0;
            statsData.casesByType = statsData.casesByType || this.getMockDashboardData().casesByType;
            statsData.monthlyTrends = statsData.monthlyTrends || this.getMockDashboardData().monthlyTrends;

            return statsData;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Return mock data if API fails
            return this.getMockDashboardData();
        }
    }

    /**
     * Calculate average resolution days from actual cases
     */
    async calculateAverageResolutionDays() {
        try {
            // Fetch decided cases
            const response = await axios.get(API_URL, {
                params: {
                    limit: 100,
                    status: 'decided'
                }
            });

            const cases = response.data.cases || response.data;
            if (!Array.isArray(cases) || cases.length === 0) {
                return 156; // Default fallback
            }

            let totalDays = 0;
            let validCases = 0;

            cases.forEach(caseItem => {
                // Calculate days between filing and decision
                if (caseItem.filingDate && caseItem.decisionDate) {
                    const filingDate = new Date(caseItem.filingDate);
                    const decisionDate = new Date(caseItem.decisionDate);
                    const days = Math.floor((decisionDate - filingDate) / (1000 * 60 * 60 * 24));

                    if (days > 0 && days < 3650) { // Sanity check: between 0 and 10 years
                        totalDays += days;
                        validCases++;
                    }
                }
            });

            return validCases > 0 ? Math.round(totalDays / validCases) : 156;
        } catch (error) {
            console.error('Error calculating average resolution days:', error);
            return 156; // Default fallback
        }
    }

    /**
     * Transform API stats data to dashboard format
     */
    transformStatsData(apiData) {
        // Transform the API response to match our dashboard structure
        return {
            totalCases: apiData.totalCases || 0,
            pendingCases: apiData.pendingCases || 0,
            decidedCases: apiData.decidedCases || 0,
            appealedCases: apiData.appealedCases || 0,
            totalTaxDisputed: apiData.totalTaxDisputed || 0,
            totalTaxRecovered: apiData.totalTaxRecovered || 0,
            averageResolutionDays: apiData.averageResolutionDays || 0,
            casesByType: apiData.casesByType || this.getMockDashboardData().casesByType,
            monthlyTrends: apiData.monthlyTrends || this.getMockDashboardData().monthlyTrends
        };
    }

    /**
     * Get cases grouped by chairperson/judge
     * Aggregates from all cases (Decision Portal - all cases are decided)
     */
    async getCasesByJudge() {
        try {
            // Always aggregate from all cases for consistency
            const casesResponse = await axios.get(API_URL, { params: { limit: 10000 } });
            const cases = casesResponse.data.cases || casesResponse.data || [];

            if (Array.isArray(cases) && cases.length > 0) {
                return this.aggregateCasesByChairperson(cases);
            }

            return this.getMockCasesByJudge();
        } catch (error) {
            console.error('Error fetching cases by judge:', error);
            return this.getMockCasesByJudge();
        }
    }

    /**
     * Aggregate cases by chairperson from case list
     */
    aggregateCasesByChairperson(cases) {
        const chairpersonMap = {};

        cases.forEach(caseItem => {
            const chairperson = caseItem.chairperson || 'Not assigned';

            if (!chairpersonMap[chairperson]) {
                chairpersonMap[chairperson] = {
                    chairperson,
                    totalCases: 0,
                    pending: 0,
                    decided: 0,
                    allowed: 0,
                    dismissed: 0,
                    partiallyAllowed: 0,
                    remanded: 0,
                    totalDays: 0,
                    decidedCount: 0
                };
            }

            const data = chairpersonMap[chairperson];
            data.totalCases++;

            // Count by status
            if (caseItem.status === 'pending') {
                data.pending++;
            } else {
                data.decided++;
            }

            // Count by outcome
            const outcome = (caseItem.outcome || '').toLowerCase();
            if (outcome === 'allowed') {
                data.allowed++;
            } else if (outcome === 'dismissed') {
                data.dismissed++;
            } else if (outcome === 'partially_allowed' || outcome === 'partially allowed') {
                data.partiallyAllowed++;
            } else if (outcome === 'remanded') {
                data.remanded++;
            }

            // Calculate average resolution days
            if (caseItem.decisionDate && caseItem.filingDate) {
                const days = Math.floor((new Date(caseItem.decisionDate) - new Date(caseItem.filingDate)) / (1000 * 60 * 60 * 24));
                data.totalDays += days;
                data.decidedCount++;
            }
        });

        // Convert to array and calculate averages
        return Object.values(chairpersonMap).map(data => ({
            chairperson: data.chairperson,
            totalCases: data.totalCases,
            pending: data.pending,
            decided: data.decided,
            allowed: data.allowed,
            dismissed: data.dismissed,
            partiallyAllowed: data.partiallyAllowed,
            remanded: data.remanded,
            avgResolutionDays: data.decidedCount > 0 ? Math.round(data.totalDays / data.decidedCount) : 0
        })).sort((a, b) => b.totalCases - a.totalCases);
    }

    /**
     * Get cases grouped by status
     * This data comes from the stats endpoint or aggregated from actual cases
     */
    async getCasesByStatus() {
        try {
            const response = await axios.get(`${API_URL}/stats`);
            const data = response.data;

            // Extract status counts from stats response
            if (data.casesByStatus) {
                return data.casesByStatus;
            }

            // Try to construct from available stats data
            if (data.totalCases > 0) {
                return {
                    pending: data.pendingCases || 0,
                    decided: data.decidedCases || 0,
                    appealed: data.appealedCases || 0,
                    withdrawn: data.withdrawnCases || 0,
                    settled: data.settledCases || 0
                };
            }

            // Aggregate from actual cases if stats don't have the data
            const statusData = await this.aggregateCasesByStatus();

            // Only use mock data if aggregation also fails
            if (statusData.pending === 0 && statusData.decided === 0 &&
                statusData.appealed === 0 && statusData.withdrawn === 0 && statusData.settled === 0) {
                return this.getMockCasesByStatus();
            }

            return statusData;
        } catch (error) {
            console.error('Error fetching cases by status:', error);
            return this.getMockCasesByStatus();
        }
    }

    /**
     * Aggregate case status from actual case data
     */
    async aggregateCasesByStatus() {
        try {
            const response = await axios.get(API_URL, {
                params: { limit: 1000 }
            });

            const cases = response.data.cases || response.data;
            if (!Array.isArray(cases)) {
                return {
                    pending: 0,
                    decided: 0,
                    appealed: 0,
                    withdrawn: 0,
                    settled: 0
                };
            }

            const statuses = {
                pending: 0,
                decided: 0,
                appealed: 0,
                withdrawn: 0,
                settled: 0
            };

            cases.forEach(caseItem => {
                const status = (caseItem.status || '').toLowerCase();

                if (status === 'pending') {
                    statuses.pending++;
                } else if (status === 'decided') {
                    statuses.decided++;
                } else if (status === 'appealed') {
                    statuses.appealed++;
                } else if (status === 'withdrawn') {
                    statuses.withdrawn++;
                } else if (status === 'settled') {
                    statuses.settled++;
                }
            });

            return statuses;
        } catch (error) {
            console.error('Error aggregating cases by status:', error);
            return {
                pending: 0,
                decided: 0,
                appealed: 0,
                withdrawn: 0,
                settled: 0
            };
        }
    }

    /**
     * Get cases grouped by outcome
     * This data comes from the stats endpoint or aggregated from actual cases
     */
    async getCasesByOutcome() {
        try {
            const response = await axios.get(`${API_URL}/stats`);
            const data = response.data;

            // Extract outcome counts from stats response
            if (data.casesByOutcome) {
                return data.casesByOutcome;
            }

            // If not in stats, aggregate from actual cases
            const outcomeData = await this.aggregateCasesByOutcome();

            // Only use mock data if aggregation also fails
            if (outcomeData.allowed === 0 && outcomeData.dismissed === 0 &&
                outcomeData.partially_allowed === 0 && outcomeData.remanded === 0) {
                return this.getMockCasesByOutcome();
            }

            return outcomeData;
        } catch (error) {
            console.error('Error fetching cases by outcome:', error);
            return this.getMockCasesByOutcome();
        }
    }

    /**
     * Aggregate case outcomes from actual case data
     */
    async aggregateCasesByOutcome() {
        try {
            // Fetch all decided cases
            const response = await axios.get(API_URL, {
                params: {
                    limit: 1000,
                    status: 'decided'
                }
            });

            const cases = response.data.cases || response.data;
            if (!Array.isArray(cases)) {
                return {
                    allowed: 0,
                    dismissed: 0,
                    partially_allowed: 0,
                    remanded: 0
                };
            }

            const outcomes = {
                allowed: 0,
                dismissed: 0,
                partially_allowed: 0,
                remanded: 0
            };

            cases.forEach(caseItem => {
                const outcome = (caseItem.outcome || '').toLowerCase().replace(/\s+/g, '_');

                if (outcome === 'allowed') {
                    outcomes.allowed++;
                } else if (outcome === 'dismissed') {
                    outcomes.dismissed++;
                } else if (outcome === 'partially_allowed' || outcome === 'partial') {
                    outcomes.partially_allowed++;
                } else if (outcome === 'remanded') {
                    outcomes.remanded++;
                }
            });

            return outcomes;
        } catch (error) {
            console.error('Error aggregating cases by outcome:', error);
            return {
                allowed: 0,
                dismissed: 0,
                partially_allowed: 0,
                remanded: 0
            };
        }
    }

    /**
     * Get cases grouped by tax type
     * This data comes from the stats endpoint or aggregated from actual cases
     */
    async getCasesByType() {
        try {
            const response = await axios.get(`${API_URL}/stats`);
            const data = response.data;

            // Extract type counts from stats response
            if (data.casesByType) {
                return data.casesByType;
            }

            // If not in stats, aggregate from actual cases
            const typeData = await this.aggregateCasesByType();

            // Only use mock data if aggregation also fails or returns no data
            const hasData = Object.values(typeData).some(count => count > 0);
            if (!hasData) {
                return this.getMockDashboardData().casesByType;
            }

            return typeData;
        } catch (error) {
            console.error('Error fetching cases by type:', error);
            return this.getMockDashboardData().casesByType;
        }
    }

    /**
     * Aggregate case types from actual case data
     */
    async aggregateCasesByType() {
        try {
            const response = await axios.get(API_URL, {
                params: { limit: 1000 }
            });

            const cases = response.data.cases || response.data;
            if (!Array.isArray(cases)) {
                return {};
            }

            const types = {};

            cases.forEach(caseItem => {
                // Try caseType field first, then taxType, fallback to 'Other'
                const caseType = caseItem.caseType || caseItem.taxType || 'Other';

                if (types[caseType]) {
                    types[caseType]++;
                } else {
                    types[caseType] = 1;
                }
            });

            return types;
        } catch (error) {
            console.error('Error aggregating cases by type:', error);
            return {};
        }
    }

    /**
     * Get all cases with pagination
     * Uses /api/v1/cases
     */
    async getAllCases(page = 1, limit = 10) {
        try {
            const response = await axios.get(API_URL, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching all cases:', error);
            return { cases: [], total: 0, page: 1, limit: 10 };
        }
    }

    /**
     * Get case by ID
     * Uses /api/v1/cases/{id}
     */
    async getCaseById(id) {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching case by ID:', error);
            return null;
        }
    }

    /**
     * Get case by case number
     * Uses /api/v1/cases/number/{caseNumber}
     */
    async getCaseByCaseNumber(caseNumber) {
        try {
            const response = await axios.get(`${API_URL}/number/${caseNumber}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching case by case number:', error);
            return null;
        }
    }

    /**
     * Get recent cases/decisions
     * Uses /api/v1/cases/recent
     */
    async getRecentDecisions() {
        try {
            const response = await axios.get(`${API_URL}/recent`);
            // Transform the response to match our dashboard format
            return this.transformRecentCases(response.data);
        } catch (error) {
            console.error('Error fetching recent decisions:', error);
            return this.getMockRecentDecisions();
        }
    }

    /**
     * Transform recent cases to match dashboard format
     */
    transformRecentCases(cases) {
        if (!cases || !Array.isArray(cases)) {
            return this.getMockRecentDecisions();
        }

        return cases.map(caseItem => ({
            id: caseItem.id, // Include case ID for navigation
            caseNumber: caseItem.caseNumber || 'N/A',
            appellant: caseItem.appellant || 'Unknown',
            outcome: caseItem.outcome || 'pending',
            taxAmount: caseItem.taxAmountDisputed || 0,
            decisionDate: caseItem.decisionDate || caseItem.filingDate || new Date().toISOString().split('T')[0],
            chairperson: caseItem.chairperson || 'Not assigned'
        }));
    }

    /**
     * Mock data for development/testing
     */
    getMockDashboardData() {
        return {
            totalCases: 1247,
            pendingCases: 342,
            decidedCases: 789,
            appealedCases: 116,
            totalTaxDisputed: 45678900000, // TZS
            totalTaxRecovered: 23456700000, // TZS
            averageResolutionDays: 156,
            casesByType: {
                'Income Tax': 456,
                'VAT': 298,
                'Customs & Excise': 234,
                'Withholding Tax': 156,
                'PAYE': 103
            },
            monthlyTrends: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                filed: [45, 52, 48, 61, 55, 67, 72, 68, 58, 63, 71, 65],
                decided: [38, 42, 45, 48, 52, 55, 58, 62, 54, 59, 65, 61],
                pending: [12, 22, 25, 38, 41, 53, 67, 73, 77, 81, 87, 91]
            }
        };
    }

    getMockCasesByJudge() {
        return [
            {
                chairperson: 'Hon. Dr. Azaveli M. Lwiza',
                totalCases: 234,
                pending: 45,
                decided: 189,
                allowed: 79,
                dismissed: 65,
                partiallyAllowed: 35,
                remanded: 10,
                avgResolutionDays: 142
            },
            {
                chairperson: 'Hon. Hamza A. Johari',
                totalCases: 198,
                pending: 38,
                decided: 160,
                allowed: 61,
                dismissed: 68,
                partiallyAllowed: 25,
                remanded: 6,
                avgResolutionDays: 167
            },
            {
                chairperson: 'Hon. Dr. Happiness E. Murusuri',
                totalCases: 187,
                pending: 52,
                decided: 135,
                allowed: 61,
                dismissed: 48,
                partiallyAllowed: 20,
                remanded: 6,
                avgResolutionDays: 134
            },
            {
                chairperson: 'Hon. Jokate J. Shija',
                totalCases: 176,
                pending: 41,
                decided: 135,
                allowed: 55,
                dismissed: 54,
                partiallyAllowed: 22,
                remanded: 4,
                avgResolutionDays: 156
            },
            {
                chairperson: 'Hon. Joachim M. Ngerageza',
                totalCases: 165,
                pending: 36,
                decided: 129,
                allowed: 50,
                dismissed: 55,
                partiallyAllowed: 20,
                remanded: 4,
                avgResolutionDays: 148
            },
            {
                chairperson: 'Hon. Prof. Gamaliel P. Masanja',
                totalCases: 158,
                pending: 47,
                decided: 111,
                allowed: 52,
                dismissed: 40,
                partiallyAllowed: 16,
                remanded: 3,
                avgResolutionDays: 161
            },
            {
                chairperson: 'Hon. Petro R. Kyando',
                totalCases: 129,
                pending: 33,
                decided: 96,
                allowed: 35,
                dismissed: 42,
                partiallyAllowed: 16,
                remanded: 3,
                avgResolutionDays: 152
            }
        ];
    }

    getMockCasesByStatus() {
        return {
            pending: 342,
            decided: 789,
            appealed: 116,
            withdrawn: 67,
            settled: 45
        };
    }

    getMockCasesByOutcome() {
        return {
            allowed: 312,
            dismissed: 267,
            partially_allowed: 178,
            remanded: 32
        };
    }

    getMockRecentDecisions() {
        return [
            {
                id: 'mock-case-1',
                caseNumber: 'TRAB/VAT/APP/2024/156',
                appellant: 'ABC Trading Company Ltd',
                outcome: 'allowed',
                taxAmount: 45678000,
                decisionDate: '2024-01-15',
                chairperson: 'Hon. Dr. Azaveli M. Lwiza'
            },
            {
                id: 'mock-case-2',
                caseNumber: 'TRAB/IT/APP/2024/134',
                appellant: 'XYZ Manufacturing Ltd',
                outcome: 'partially_allowed',
                taxAmount: 123456000,
                decisionDate: '2024-01-14',
                chairperson: 'Hon. Hamza A. Johari'
            },
            {
                id: 'mock-case-3',
                caseNumber: 'TRAB/CE/APP/2024/089',
                appellant: 'Global Imports & Exports',
                outcome: 'dismissed',
                taxAmount: 87654000,
                decisionDate: '2024-01-12',
                chairperson: 'Hon. Dr. Happiness E. Murusuri'
            },
            {
                id: 'mock-case-4',
                caseNumber: 'TRAB/VAT/APP/2024/145',
                appellant: 'Tech Solutions Tanzania',
                outcome: 'allowed',
                taxAmount: 34567000,
                decisionDate: '2024-01-10',
                chairperson: 'Hon. Jokate J. Shija'
            },
            {
                id: 'mock-case-5',
                caseNumber: 'TRAB/IT/APP/2024/098',
                appellant: 'Coastal Traders Ltd',
                outcome: 'remanded',
                taxAmount: 156789000,
                decisionDate: '2024-01-08',
                chairperson: 'Hon. Joachim M. Ngerageza'
            }
        ];
    }
}

export default new DashboardService();

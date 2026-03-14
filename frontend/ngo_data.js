// NGO Data Management System
// Using localStorage for persistence

class NGODataManager {
    constructor() {
        this.ngoId = 'helping_hands_foundation';
        this.initializeData();
    }

    initializeData() {
        if (!localStorage.getItem(this.ngoId)) {
            const initialData = {
                name: 'Helping Hands Foundation',
                donations: {
                    totalReceived: 0,
                    accepted: 0,
                    completed: 0,
                    pending: 0,
                    rejected: 0,
                    history: []
                },
                volunteers: {
                    total: 0,
                    active: 0,
                    inactive: 0,
                    list: []
                },
                reports: {
                    monthlyStats: {},
                    performance: {
                        avgResponseTime: 0,
                        successRate: 0,
                        totalMealsDistributed: 0
                    }
                },
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.ngoId, JSON.stringify(initialData));
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem(this.ngoId));
    }

    updateData(updates) {
        const data = this.getData();
        Object.assign(data, updates);
        data.lastUpdated = new Date().toISOString();
        localStorage.setItem(this.ngoId, JSON.stringify(data));
        return data;
    }

    // Donation methods
    addDonation(donation) {
        const data = this.getData();
        data.donations.totalReceived++;
        data.donations.pending++;
        donation.id = Date.now().toString();
        donation.status = 'pending';
        donation.timestamp = new Date().toISOString();
        data.donations.history.unshift(donation);
        this.updateData(data);
        return donation;
    }

    acceptDonation(donationId) {
        const data = this.getData();
        const donation = data.donations.history.find(d => d.id === donationId);
        if (donation && donation.status === 'pending') {
            donation.status = 'accepted';
            data.donations.pending--;
            data.donations.accepted++;
            this.updateData(data);
            return true;
        }
        return false;
    }

    completeDonation(donationId) {
        const data = this.getData();
        const donation = data.donations.history.find(d => d.id === donationId);
        if (donation && donation.status === 'accepted') {
            donation.status = 'completed';
            donation.completedAt = new Date().toISOString();
            data.donations.accepted--;
            data.donations.completed++;
            data.reports.performance.totalMealsDistributed += donation.quantity || 1;
            this.updateData(data);
            return true;
        }
        return false;
    }

    rejectDonation(donationId) {
        const data = this.getData();
        const donation = data.donations.history.find(d => d.id === donationId);
        if (donation && donation.status === 'pending') {
            donation.status = 'rejected';
            data.donations.pending--;
            data.donations.rejected++;
            this.updateData(data);
            return true;
        }
        return false;
    }

    // Volunteer methods
    addVolunteer(volunteer) {
        const data = this.getData();
        volunteer.id = Date.now().toString();
        volunteer.status = 'active';
        volunteer.joinedAt = new Date().toISOString();
        data.volunteers.list.push(volunteer);
        data.volunteers.total++;
        data.volunteers.active++;
        this.updateData(data);
        return volunteer;
    }

    updateVolunteerStatus(volunteerId, status) {
        const data = this.getData();
        const volunteer = data.volunteers.list.find(v => v.id === volunteerId);
        if (volunteer) {
            if (volunteer.status === 'active' && status !== 'active') {
                data.volunteers.active--;
                data.volunteers.inactive++;
            } else if (volunteer.status !== 'active' && status === 'active') {
                data.volunteers.active++;
                data.volunteers.inactive--;
            }
            volunteer.status = status;
            this.updateData(data);
            return true;
        }
        return false;
    }

    // Reports methods
    generateMonthlyReport(month, year) {
        const data = this.getData();
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

        if (!data.reports.monthlyStats[monthKey]) {
            data.reports.monthlyStats[monthKey] = {
                donationsReceived: 0,
                donationsCompleted: 0,
                volunteersActive: data.volunteers.active,
                mealsDistributed: 0
            };
        }

        // Calculate stats for the month
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);

        data.donations.history.forEach(donation => {
            const donationDate = new Date(donation.timestamp);
            if (donationDate >= monthStart && donationDate <= monthEnd) {
                data.reports.monthlyStats[monthKey].donationsReceived++;
                if (donation.status === 'completed') {
                    data.reports.monthlyStats[monthKey].donationsCompleted++;
                    data.reports.monthlyStats[monthKey].mealsDistributed += donation.quantity || 1;
                }
            }
        });

        this.updateData(data);
        return data.reports.monthlyStats[monthKey];
    }

    // Utility methods
    getRecentDonations(limit = 10) {
        const data = this.getData();
        return data.donations.history.slice(0, limit);
    }

    getActiveVolunteers() {
        const data = this.getData();
        return data.volunteers.list.filter(v => v.status === 'active');
    }

    getPendingDonations() {
        const data = this.getData();
        return data.donations.history.filter(d => d.status === 'pending');
    }

    getCompletedDonations() {
        const data = this.getData();
        return data.donations.history.filter(d => d.status === 'completed');
    }
}

// Global instance
const ngoDataManager = new NGODataManager();

// Initialize with some sample data if empty
if (ngoDataManager.getData().donations.history.length === 0) {
    // Add some sample donations
    ngoDataManager.addDonation({
        donorName: 'John Smith',
        foodType: 'Rice and Vegetables',
        quantity: 50,
        location: 'Downtown Area',
        contact: 'john@example.com'
    });

    ngoDataManager.addDonation({
        donorName: 'Mary Johnson',
        foodType: 'Bread and Fruits',
        quantity: 30,
        location: 'North District',
        contact: 'mary@example.com'
    });

    // Accept and complete one
    const donations = ngoDataManager.getPendingDonations();
    if (donations.length > 0) {
        ngoDataManager.acceptDonation(donations[0].id);
        ngoDataManager.completeDonation(donations[0].id);
    }

    // Add sample volunteers
    ngoDataManager.addVolunteer({
        name: 'Alice Brown',
        email: 'alice@example.com',
        phone: '123-456-7890',
        skills: ['Food Distribution', 'Community Outreach']
    });

    ngoDataManager.addVolunteer({
        name: 'Bob Wilson',
        email: 'bob@example.com',
        phone: '987-654-3210',
        skills: ['Logistics', 'Event Planning']
    });
}
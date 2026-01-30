const cron = require('node-cron');
const Project = require('../models/Project');
const { sendDeadlineReminder } = require('../services/emailService');

// Check deadlines and update status
const checkDeadlines = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const projects = await Project.find({
            deadline: { $exists: true },
            status: { $nin: ['Completed'] }
        });

        for (const project of projects) {
            const deadline = new Date(project.deadline);
            deadline.setHours(0, 0, 0, 0);

            const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

            // Auto-update to Overdue if past deadline
            if (daysUntilDeadline < 0 && project.status !== 'Overdue') {
                project.status = 'Overdue';
                await project.save();
                console.log(`Project ${project.projectName} marked as Overdue`);
            }

            // Send email reminders
            // 7 days before, 3 days before, 1 day before, and when overdue
            if (daysUntilDeadline === 7 || daysUntilDeadline === 3 || daysUntilDeadline === 1 || daysUntilDeadline <= 0) {
                await sendDeadlineReminder(project, daysUntilDeadline);
            }
        }

        console.log('Deadline check completed');
    } catch (error) {
        console.error('Deadline check error:', error);
    }
};

// Run every day at 9:00 AM
const startDeadlineChecker = () => {
    // Run immediately on startup
    checkDeadlines();

    // Schedule daily at 9:00 AM
    cron.schedule('0 9 * * *', () => {
        console.log('Running daily deadline check...');
        checkDeadlines();
    });

    console.log('Deadline checker started - runs daily at 9:00 AM');
};

module.exports = { startDeadlineChecker, checkDeadlines };

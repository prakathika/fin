const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
});

// Send deadline reminder email
const sendDeadlineReminder = async (project, daysUntilDeadline) => {
    const recipients = ['mukilan2808@gmail.com', 'prakathika2815@gmail.com'];

    const subject = daysUntilDeadline <= 0
        ? `⚠️ OVERDUE: ${project.projectName}`
        : `⏰ Deadline Reminder: ${project.projectName}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1A1D21; padding: 20px; text-align: center;">
                <h1 style="color: #D6F32E; margin: 0;">Xarlex Finance</h1>
                <p style="color: #fff; margin: 5px 0;">Project Deadline Alert</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #1A1D21;">Project: ${project.projectName}</h2>
                
                <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p><strong>Client:</strong> ${project.clientName}</p>
                    <p><strong>Ticket:</strong> ${project.ticketNumber || 'N/A'}</p>
                    <p><strong>Status:</strong> <span style="color: ${getStatusColor(project.status)}">${project.status}</span></p>
                    <p><strong>Deadline:</strong> ${new Date(project.deadline).toLocaleDateString()}</p>
                    <p><strong>Days ${daysUntilDeadline <= 0 ? 'Overdue' : 'Remaining'}:</strong> 
                        <span style="color: ${daysUntilDeadline <= 0 ? '#EF4444' : '#F59E0B'}; font-weight: bold;">
                            ${Math.abs(daysUntilDeadline)} days
                        </span>
                    </p>
                </div>
                
                ${daysUntilDeadline <= 0 ?
            '<p style="color: #EF4444; font-weight: bold;">⚠️ This project is OVERDUE! Please take immediate action.</p>' :
            '<p style="color: #F59E0B;">⏰ This project deadline is approaching soon.</p>'
        }
                
                <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
                    This is an automated reminder from Xarlex Finance Project Tracker.
                </p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: '"Xarlex Finance" <noreply@xarlex.com>',
            to: recipients.join(', '),
            subject: subject,
            html: html
        });
        console.log(`Email sent for project: ${project.projectName}`);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

const getStatusColor = (status) => {
    const colors = {
        'Not Started': '#9CA3AF',
        'In Progress': '#3B82F6',
        'Completed': '#10B981',
        'On Hold': '#F59E0B',
        'Overdue': '#EF4444'
    };
    return colors[status] || '#6B7280';
};

module.exports = { sendDeadlineReminder };

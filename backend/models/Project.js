const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    // Project Info
    projectName: { type: String, required: true },
    clientName: { type: String, required: true },
    githubLink: { type: String },
    projectImage: { type: String },
    ticketNumber: { type: String },
    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Overdue'], default: 'Not Started' },
    deadline: { type: Date },

    // Payment Info
    totalAmount: { type: Number, required: true },
    amountReceived: { type: Number, default: 0 },
    amountPending: { type: Number },

    // Important Dates
    startDate: { type: Date },
    submissionDate: { type: Date },
    paymentDate: { type: Date },

    // Additional Details
    paymentMethod: { type: String },
    notes: { type: String },

    createdAt: { type: Date, default: Date.now }
});

// Fix: Removed 'next' callback parameter to prevent "next is not a function" errors in newer Mongoose versions/contexts
ProjectSchema.pre('save', function () {
    // Generate ticket number if not exists
    if (!this.ticketNumber) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.ticketNumber = `XF-${timestamp}${random}`;
    }

    // Calculate pending amount
    if (this.totalAmount !== undefined && this.amountReceived !== undefined) {
        this.amountPending = this.totalAmount - this.amountReceived;
    }
});

module.exports = mongoose.model('Project', ProjectSchema);

const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    // Project Info
    projectName: { type: String, required: true },
    clientName: { type: String, required: true },
    githubLink: { type: String },
    projectImage: { type: String }, // New Field for "Dashboard as image" request
    status: { type: String, enum: ['Ongoing', 'Completed'], default: 'Ongoing' },

    // Payment Info
    totalAmount: { type: Number, required: true },
    amountReceived: { type: Number, default: 0 },
    amountPending: { type: Number },

    // Important Dates
    startDate: { type: Date },
    submissionDate: { type: Date },
    paymentDate: { type: Date },

    // Additional Details
    paymentMethod: { type: String, enum: ['UPI', 'Cash', 'Bank Transfer', 'Other'] },
    notes: { type: String },

    createdAt: { type: Date, default: Date.now }
});

// Fix: Removed 'next' callback parameter to prevent "next is not a function" errors in newer Mongoose versions/contexts
ProjectSchema.pre('save', function () {
    if (this.totalAmount !== undefined && this.amountReceived !== undefined) {
        this.amountPending = this.totalAmount - this.amountReceived;
    }
});

module.exports = mongoose.model('Project', ProjectSchema);

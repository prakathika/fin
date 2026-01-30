const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// GET all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const projects = await Project.find();

        const totalEarned = projects.reduce((acc, curr) => acc + (curr.amountReceived || 0), 0);
        const totalPending = projects.reduce((acc, curr) => acc + (curr.amountPending || 0), 0);
        const completedProjects = projects.filter(p => p.status === 'Completed').length;

        res.json({
            totalEarned,
            totalPending,
            completedProjects
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new project
router.post('/', async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.projectName || !req.body.clientName || !req.body.totalAmount) {
            return res.status(400).json({
                message: 'Missing required fields: projectName, clientName, and totalAmount are required'
            });
        }

        const project = new Project({
            projectName: req.body.projectName,
            clientName: req.body.clientName,
            githubLink: req.body.githubLink,
            status: req.body.status || 'Not Started',
            totalAmount: req.body.totalAmount,
            amountReceived: req.body.amountReceived || 0,
            startDate: req.body.startDate,
            deadline: req.body.deadline,
            submissionDate: req.body.submissionDate,
            paymentDate: req.body.paymentDate,
            paymentMethod: req.body.paymentMethod || 'Bank Transfer',
            notes: req.body.notes
        });

        const newProject = await project.save();
        res.status(201).json(newProject);
    } catch (err) {
        console.error('Project creation error:', err);
        res.status(400).json({
            message: err.message,
            details: err.errors ? Object.keys(err.errors).map(key => ({
                field: key,
                message: err.errors[key].message
            })) : []
        });
    }
});

// PUT update project
router.patch('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        Object.keys(req.body).forEach(key => {
            project[key] = req.body[key];
        });

        // Recalculate pending if amounts changed happens in pre-save, but we must modify the fields
        // explicitly so simple assignment works.

        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

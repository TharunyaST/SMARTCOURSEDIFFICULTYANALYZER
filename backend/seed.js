const mongoose = require('mongoose');
const connectDB = require('./db');
const Subject = require('./models/Subject');
const Review = require('./models/Review');
const Material = require('./models/Material');
const Notification = require('./models/Notification');
require('dotenv').config();

const seedDB = async () => {
    try {
        await connectDB();
        console.log('Connected to DB for seeding...');

        // Clear existing data to prevent duplicates
        await Review.deleteMany({});
        await Material.deleteMany({});
        await Notification.deleteMany({});
        console.log('Cleared existing Reviews, Materials, and Notifications.');

        // Add subjects
        const subjects = [
            { code: 'CS101', name: 'Intro to Programming' },
            { code: 'CS102', name: 'Data Structures' },
            { code: 'CS201', name: 'Database Systems' },
            { code: 'CS301', name: 'Algorithms' },
            { code: 'MTH101', name: 'Calculus I' },
            { code: 'PHY101', name: 'Physics I' }
        ];

        for (const sub of subjects) {
            let existing = await Subject.findOne({ code: sub.code });
            if (!existing) {
                await Subject.create(sub);
                console.log(`Created subject ${sub.code}`);
            }
        }

        // Add realistic randomized reviews
        const allSubjects = await Subject.find();
        
        const realisticFeedbacks = [
            "The course material was very engaging, though the exams were quite challenging.",
            "Excellent explanation of core concepts! I wish we had more interactive exercises.",
            "Found the pacing to be a bit fast during the second half, but overall a great learning experience.",
            "The assignments were tough but really helped me grasp the practical applications.",
            "Very theoretical. I highly recommend reading the textbook beforehand to stay on track.",
            "Loved the structure of the course. The professor's presentation slides were incredibly helpful for revision.",
            "Some topics were hard to digest initially, but the supplementary video materials cleared things up.",
            "The final project effectively tied everything we learned together. Highly recommended but demands time."
        ];

        for (const sub of allSubjects) {
            // Create 3-5 reviews per subject
            const numReviews = Math.floor(Math.random() * 3) + 3; 
            for (let i=0; i<numReviews; i++) {
                const rating = Math.floor(Math.random() * 4) + 2; // 2 to 5
                const marks = Math.floor(Math.random() * 50) + 40; // 40 to 90
                const selectedFeedback = realisticFeedbacks[Math.floor(Math.random() * realisticFeedbacks.length)];
                await Review.create({
                    subject_code: sub.code,
                    rating: rating,
                    marks: marks,
                    feedback: selectedFeedback
                });
            }
            
            // Create materials
            await Material.create({
                subject_code: sub.code,
                title: `${sub.name} Final Revision Notes`,
                uploaded_by: 'Teacher Dummy',
                fileUrl: 'https://example.com/dummy-material.pdf'
            });

            // Create notification
            await Notification.create({
                subject_name: sub.name,
                message: `New materials uploaded for ${sub.name}.`
            });
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed error:', err);
        process.exit(1);
    }
};

seedDB();

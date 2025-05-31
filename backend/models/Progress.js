const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
    quizId: String,
    score: Number,
    totalQuestions: Number,
    percentage: Number,
    answers: mongoose.Schema.Types.Mixed,
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

const progressSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    currentSlide: {
        type: Number,
        default: 0
    },
    completedSlides: {
        type: Number,
        default: 0
    },
    quizResults: [quizResultSchema],
    totalStudyTime: {
        type: Number,
        default: 0 // in minutes
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: Date,
    lastAccessedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate progress percentage
progressSchema.virtual('progressPercentage').get(function() {
    if (!this.course || !this.course.pdfContent) return 0;
    // Assuming 10 slides per course for now
    const totalSlides = 10;
    return Math.round((this.completedSlides / totalSlides) * 100);
});

module.exports = mongoose.model('Progress', progressSchema);
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
    // Use the actual number of slides if available
    if (this.populated('course') && this.course && Array.isArray(this.course.content)) {
        const totalSlides = this.course.content.length;
        if (!totalSlides) return 0;
        return Math.round((this.completedSlides / totalSlides) * 100);
    }
    // fallback: try to estimate from pdfContent (not ideal)
    if (this.course && this.course.pdfContent) {
        const approxSlides = this.course.pdfContent.split(/\n\n+/).length;
        return Math.round((this.completedSlides / approxSlides) * 100);
    }
    return 0;
});

module.exports = mongoose.model('Progress', progressSchema);
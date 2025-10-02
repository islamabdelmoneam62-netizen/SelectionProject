const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// ----------------------------------------------------
// 1. تعريف المتغيرات من بيئة Vercel
// ----------------------------------------------------
const mongoURI = process.env.MONGO_URI; 
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const PORT = process.env.PORT || 3000;

// التأكد من وجود الرابط قبل الاتصال
if (!mongoURI) {
    console.error("FATAL ERROR: MONGO_URI is not defined.");
    process.exit(1); 
}

// ----------------------------------------------------
// 2. الاتصال بقاعدة البيانات
// ----------------------------------------------------
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); 
  });


const app = express();


// ----------------------------------------------------
// 3. تعريف المخططات (Schemas) والنماذج (Models)
// ----------------------------------------------------

// يجب أن تضمن أن لديك مخطط Student و Selection هنا 
// مثال:
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    major: { type: String, required: true },
    course: { type: String, required: true },
}, { timestamps: true });
const Student = mongoose.model('Student', studentSchema);

const selectionSchema = new mongoose.Schema({
    //... باقي حقول المخطط
}, { _id: false });
const Selection = mongoose.model('Selection', selectionSchema);


// ----------------------------------------------------
// 4. Middleware
// ----------------------------------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// لخدمة الملفات الثابتة من مجلد 'public'
app.use(express.static(path.join(__dirname, 'public')));


// ----------------------------------------------------
// 5. مسارات API الجديدة (تبدأ بـ /api/)
// ----------------------------------------------------

// مسار التسجيل: /api/register
app.post('/api/register', async (req, res) => {
    try {
        const { name, studentId, major, course } = req.body;
        
        // **هنا يجب أن تضع كود التحقق من التسجيل والحفظ في DB**
        
        res.status(201).json({ success: true, message: 'تم التسجيل بنجاح!' });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: 'حدث خطأ في الخادم أثناء التسجيل.' });
    }
});


// مسار جلب الأعداد: /api/counts
app.get('/api/counts', async (req, res) => {
    try {
        const totalCount = await Student.countDocuments({});
        // هنا يمكنك إضافة حسابات أخرى وجعلها جزء من الرد
        res.json({ success: true, totalCount: totalCount });
    } catch (error) {
        console.error("Counts error:", error);
        res.status(500).json({ success: false, message: 'خطأ في جلب الأعداد.' });
    }
});

// مسار جلب كل الطلاب: /api/students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find({});
        res.json(students);
    } catch (error) {
        console.error("Students list error:", error);
        res.status(500).json({ success: false, message: 'خطأ في جلب قائمة الطلاب.' });
    }
});


// مسار التحقق من الإدارة: /api/admin/check
app.post('/api/admin/check', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
    }
});


// ----------------------------------------------------
// 6. تشغيل الخادم
// ----------------------------------------------------
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
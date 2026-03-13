const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getRecommendedCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isRecommended: true },
      orderBy: { createdAt: 'desc' },
      take: 10, // Fetch up to 10 recommended courses for the home page
    });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('获取推荐课程失败:', error);
    res.status(500).json({ success: false, message: '获取推荐课程失败' });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('获取所有课程失败:', error);
    res.status(500).json({ success: false, message: '获取所有课程失败' });
  }
};

exports.getCourseDetail = async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!course) {
      return res.status(404).json({ success: false, message: '课程不存在' });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取课程详情失败' });
  }
};

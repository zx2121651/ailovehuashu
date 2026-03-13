const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('获取课程失败:', error);
    res.status(500).json({ success: false, message: '获取课程失败' });
  }
};

exports.getCourseById = async (req, res) => {
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

exports.createCourse = async (req, res) => {
  try {
    const { title, desc, cover, link, isRecommended, tags, rating, students } = req.body;
    const course = await prisma.course.create({
      data: {
        title,
        desc,
        cover,
        link,
        isRecommended: Boolean(isRecommended),
        tags: tags || [],
        rating: rating || 0,
        students: students || 0,
        instructor: req.body.instructor || null,
        lessons: req.body.lessons || null,
      },
    });
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('创建课程失败:', error);
    res.status(500).json({ success: false, message: '创建课程失败' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { title, desc, cover, link, isRecommended, tags, rating, students } = req.body;
    const course = await prisma.course.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        desc,
        cover,
        link,
        isRecommended: typeof isRecommended === 'boolean' ? isRecommended : undefined,
        tags,
        rating,
        students,
        instructor: req.body.instructor || undefined,
        lessons: req.body.lessons || undefined,
      },
    });
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('更新课程失败:', error);
    res.status(500).json({ success: false, message: '更新课程失败' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await prisma.course.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ success: true, message: '课程删除成功' });
  } catch (error) {
    console.error('删除课程失败:', error);
    res.status(500).json({ success: false, message: '删除课程失败' });
  }
};

exports.toggleRecommended = async (req, res) => {
  try {
    const { isRecommended } = req.body;
    const course = await prisma.course.update({
      where: { id: parseInt(req.params.id) },
      data: { isRecommended: Boolean(isRecommended) },
    });
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('切换推荐状态失败:', error);
    res.status(500).json({ success: false, message: '切换推荐状态失败' });
  }
};

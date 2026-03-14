const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('=== 检查分类数据 ===');
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, count: true, type: true }
  });
  console.log('Categories:', JSON.stringify(categories, null, 2));

  console.log('\n=== 检查话术数据 ===');
  const scripts = await prisma.script.count();
  console.log('Total scripts:', scripts);

  const scriptsByCategory = await prisma.script.groupBy({
    by: ['categoryId'],
    _count: { id: true }
  });
  console.log('Scripts by categoryId:', JSON.stringify(scriptsByCategory, null, 2));

  console.log('\n=== 检查用户增长数据 ===');
  const users = await prisma.user.findMany({
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('Recent users:', JSON.stringify(users, null, 2));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

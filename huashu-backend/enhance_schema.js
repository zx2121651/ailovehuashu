const fs = require('fs');

const file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

// 1. 添加缺失的关键索引 (Indexes) 和 级联删除 (Cascade)

// 优化 User 模型 (添加邀请码索引，因为注册时经常按邀请码查询)
content = content.replace(
  'inviteCode String?  @unique',
  'inviteCode String?  @unique\n  @@index([inviteCode])'
);
content = content.replace(
  'openId     String?  @unique',
  'openId     String?  @unique\n  @@index([openId])'
);

// 优化 Script 模型 (为分类查询和点赞排序加复合索引)
const scriptModelRegex = /model Script {[\s\S]*?updatedAt DateTime @updatedAt\n}/;
const newScriptModel = `model Script {
  id         Int      @id @default(autoincrement())
  question   String   @db.Text
  type       String
  likes      Int      @default(0)
  isNew      Boolean  @default(false)
  isFeatured Boolean  @default(false)
  tags       String[] // Array of strings for tags like ['#暖心', '#高情商']
  answers    String[] // Array of strings for answers

  // Relations
  categoryId Int
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 【性能核心】复合索引：极大提升在特定分类下按热门程度排序的查询速度
  @@index([categoryId, likes(sort: Desc)])
  @@index([categoryId, isFeatured, createdAt(sort: Desc)])
}`;
if (scriptModelRegex.test(content)) {
    content = content.replace(scriptModelRegex, newScriptModel);
}

// 优化 Post 模型 (社区帖子：添加联合索引加速查询)
const postModelRegex = /model Post {[\s\S]*?updatedAt DateTime @updatedAt\n}/;
const newPostModel = `model Post {
  id      Int      @id @default(autoincrement())
  content String   @db.Text // Text content of the post
  images  String[] // Array of image URLs (up to 9)
  tags    String[] // Hashtags like ['#恋爱技巧', '#求助']
  likes   Int      @default(0)
  status  String   @default("ACTIVE") // ACTIVE, HIDDEN, DELETED

  // Urgent / Bounty Feature
  isUrgent          Boolean   @default(false)
  rewardPoints      Int       @default(0)
  expireAt          DateTime?
  resolved          Boolean   @default(false)
  acceptedCommentId Int?

  // Relations
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  categoryId Int?
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  likedBy         PostLike[]
  reports         Report[]
  comments        Comment[]  @relation("PostComments")
  acceptedComment Comment?   @relation("AcceptedPostComment", fields: [acceptedCommentId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 【性能核心】社区流索引：按分类+时间，或悬赏状态加速检索
  @@index([status, categoryId, createdAt(sort: Desc)])
  @@index([status, isUrgent, resolved])
  @@index([userId])
}`;
if (postModelRegex.test(content)) {
    content = content.replace(postModelRegex, newPostModel);
}

// 优化 Order 模型 (订单表：添加商户单号索引及防并发约束)
const orderModelRegex = /model Order {[\s\S]*?updatedAt     DateTime @updatedAt\n}/;
const newOrderModel = `model Order {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Restrict)
  userName      String
  type          String   // VIP_MONTH, VIP_YEAR, COURSE_1
  amount        Float    // 支付金额（元）
  paymentMethod String   // WECHAT, ALIPAY, APPLE_PAY
  status        String   @default("PENDING") // PENDING, SUCCESS, FAILED, REFUNDED
  transactionId String?  @unique // 微信/支付宝的流水单号，确保唯一性防重发
  payTime       DateTime?

  commissionLogs CommissionLog[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // 【对账核心】按状态和用户快速查询订单
  @@index([userId, status])
  @@index([createdAt])
}`;
if (orderModelRegex.test(content)) {
    content = content.replace(orderModelRegex, newOrderModel);
}

fs.writeFileSync(file, content, 'utf8');
console.log('schema.prisma 增强替换成功');

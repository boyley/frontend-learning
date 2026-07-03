// ============================================================
// sequelize-demo.js：Sequelize 6 + SQLite 完整 CRUD 演示
//
// 目标：用 ORM 定义 Model（对象）↔ 自动映射到数据库表，
//       然后用对象方法完成增删改查，全程不手写 SQL。
//
// 用 SQLite 内存库（:memory:）：进程结束即销毁，跑一次看输出即可，
// 不留文件、不用装数据库服务。想留文件把 storage 改成 './db.sqlite'。
// ============================================================

const { Sequelize, DataTypes, Op } = require('sequelize');

// 1) 建立连接：dialect=sqlite，storage=:memory: 表示纯内存库
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false, // 关掉每条 SQL 的日志，输出更干净（想看 SQL 改成 console.log）
});

// 2) 定义 Model：User 类 ↔ users 表
//    每个字段声明「类型 + 约束」，Sequelize 据此生成建表语句。
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // 自增主键
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // NOT NULL 约束
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // 唯一约束
      validate: { isEmail: true }, // 应用层校验：必须是邮箱格式
    },
    age: {
      type: DataTypes.INTEGER,
      defaultValue: 18, // 默认值
    },
  },
  {
    tableName: 'users', // 显式表名（否则默认复数化）
    timestamps: true, // 自动加 createdAt / updatedAt 两列
  }
);

async function main() {
  // 3) sync()：根据 Model 定义在数据库里建表（force:true 先 DROP 再建，仅 demo 用）
  await sequelize.sync({ force: true });
  console.log('✅ 已建表 users\n');

  // ---------- CREATE 增 ----------
  const alice = await User.create({ name: 'Alice', email: 'alice@example.com', age: 25 });
  await User.bulkCreate([
    { name: 'Bob', email: 'bob@example.com', age: 30 },
    { name: 'Carol', email: 'carol@example.com' }, // age 用默认值 18
  ]);
  console.log('➕ CREATE：新建 Alice，id =', alice.id);

  // ---------- READ 查 ----------
  const all = await User.findAll();
  console.log('\n📋 findAll：共', all.length, '条');
  all.forEach(u => console.log(`   #${u.id} ${u.name} <${u.email}> age=${u.age}`));

  const byPk = await User.findByPk(1); // 按主键查
  console.log('\n🔍 findByPk(1)：', byPk.name);

  const adults = await User.findAll({ where: { age: { [Op.gte]: 25 } } }); // 条件查询 age>=25
  console.log('🔍 findAll(age>=25)：', adults.map(u => u.name).join(', '));

  // ---------- UPDATE 改 ----------
  await User.update({ age: 26 }, { where: { name: 'Alice' } });
  const aliceAfter = await User.findByPk(1);
  console.log('\n✏️  UPDATE：Alice 的 age 改为', aliceAfter.age);

  // ---------- DELETE 删 ----------
  const deleted = await User.destroy({ where: { name: 'Bob' } });
  console.log('🗑️  DELETE：删除了', deleted, '条（Bob）');

  const remain = await User.findAll();
  console.log('\n📋 最终剩余：', remain.map(u => u.name).join(', '));

  await sequelize.close(); // 关闭连接
  console.log('\n✅ demo 结束');
}

main().catch(err => {
  console.error('❌ 出错：', err);
  process.exit(1);
});

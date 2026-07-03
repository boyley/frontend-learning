// ============================================================
// Routes 层：路由表（URL + 方法 → 控制器方法）
// 职责：只做“地址映射”，把每个 REST 端点绑到对应的 controller 函数。
// 一眼能看清这个资源有哪些接口，不掺杂任何逻辑。
// ============================================================

const express = require('express');
const userController = require('../controllers/userController');

// 子路由：挂在 /api/users 下（在 app.js 里 app.use('/api/users', router)）
const router = express.Router();

router.get('/', userController.list); // 列表
router.get('/:id', userController.detail); // 单个
router.post('/', userController.create); // 创建
router.put('/:id', userController.update); // 更新
router.delete('/:id', userController.remove); // 删除

module.exports = router;

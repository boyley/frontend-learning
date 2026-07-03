// ============================================================
// Cypress E2E：测试代码【运行在浏览器内部】，与被测应用同处一个事件循环。
// 特色：
//   1) 链式命令 cy.xxx() 自动排队、自动重试、自动等待（无需手动 await/sleep）
//   2) 断言隐含重试：cy.get(...).should(...) 会重试到通过或超时
//   3) Time-Travel 调试：Test Runner 里可回看每一步命令时的页面快照
// 官方：https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-test
// ============================================================

describe('登录流程', () => {
  beforeEach(() => {
    // baseUrl 来自 cypress.config.js（需先 npm run serve 起静态站）
    cy.visit('/');
  });

  it('空表单提交显示校验错误', () => {
    cy.get('button[type="submit"]').click();
    // data-cy 是 Cypress 官方推荐的稳定选择器
    cy.get('[data-cy="error"]').should('contain.text', '不能为空');
  });

  it('错误密码显示“用户名或密码错误”', () => {
    cy.get('#username').type('admin');
    cy.get('#password').type('wrong-pass');
    cy.get('button[type="submit"]').click();
    cy.get('[data-cy="error"]').should('have.text', '用户名或密码错误');
    // 仍停留在登录表单
    cy.get('#dashboard').should('not.be.visible');
  });

  it('正确凭据登录成功并显示欢迎语', () => {
    cy.get('#username').type('admin');
    cy.get('#password').type('123456');
    cy.get('button[type="submit"]').click();

    // 断言会自动重试，直到 dashboard 显示
    cy.get('[data-cy="welcome"]').should('be.visible').and('contain', '欢迎回来, admin');
    cy.get('#login-form').should('not.be.visible');
  });

  it('登录后退出回到登录页', () => {
    cy.get('#username').type('admin');
    cy.get('#password').type('123456');
    cy.get('button[type="submit"]').click();
    cy.get('#dashboard').should('be.visible');

    cy.get('#logout').click();
    cy.get('#login-form').should('be.visible');
    cy.get('#username').should('have.value', ''); // 表单已重置
  });
});

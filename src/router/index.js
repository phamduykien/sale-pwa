import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('authToken');
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false && to.path !== '/login'); // Mặc định yêu cầu auth trừ khi meta.requiresAuth = false hoặc là trang login
    const isLoginPage = to.path === '/login';

    if (requiresAuth && !isAuthenticated) {
      // Nếu route yêu cầu xác thực và người dùng chưa đăng nhập, chuyển đến trang login
      // Thêm query `redirect` để sau khi đăng nhập có thể quay lại trang trước đó
      next({ path: '/login', query: { redirect: to.fullPath } });
    } else if (isLoginPage && isAuthenticated) {
      // Nếu người dùng đã đăng nhập và cố gắng vào trang login, chuyển đến trang chủ
      next('/');
    } else {
      // Cho phép điều hướng
      next();
    }
  });

  return Router
})

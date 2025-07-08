const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/system/IndexPage.vue') },
      { path: 'cart', component: () => import('src/pages/cart/CartPage.vue') },
      { path: 'orders', component: () => import('src/pages/order/OrdersPage.vue') },
      { path: 'products', name: 'products', component: () => import('src/pages/product/ProductsPage.vue') },     
      { path: 'product/:id', component: () => import('src/pages/product/ProductDetailPage.vue') },      
      { path: 'search', component: () => import('src/pages/system/SearchPage.vue') },
      { path: 'notifications', component: () => import('src/pages/system/NotificationPage.vue') },
      { path: 'profile', component: () => import('src/pages/system/ProfilePage.vue') }
    ]
  },
  {
    path: '/login',
    component: () => import('src/pages/system/LoginPage.vue')
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/system/ErrorNotFound.vue')
  }
]

export default routes

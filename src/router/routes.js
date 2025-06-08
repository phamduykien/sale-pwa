const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'cart', component: () => import('pages/CartPage.vue') },
      { path: 'products', component: () => import('pages/ProductsPage.vue') },
      { path: 'product/add', component: () => import('pages/AddProductPage.vue') },
      { path: 'product/:id', component: () => import('pages/EditProductPage.vue') },
      // { path: 'product/:id/edit', name: 'edit-product', component: () => import('pages/EditProductPage.vue') },
      { path: 'search', component: () => import('pages/SearchPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') }
    ]
  },
  {
    path: '/login',
    component: () => import('src/pages/LoginPage.vue')
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes

import { defineStore } from 'pinia'
import { api } from '../boot/axios'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    categories: [],
    loading: false,
    error: null,
    currentProduct: null
  }),

  getters: {
    getProductById: (state) => {
      return (id) => state.products.find(product => product.id === id)
    },
    getProductsByCategory: (state) => {
      return (categoryId) => state.products.filter(product => product.categoryId === categoryId)
    },
    featuredProducts: (state) => {
      return state.products.filter(product => product.featured === true)
    }
  },

  actions: {
    async fetchProducts() {
      this.loading = true
      this.error = null
      try {
        // Mock data để demo - thay thế bằng API call thực
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
        this.products = [
          {
            id: 1,
            name: 'iPhone 15 Pro',
            description: 'Điện thoại thông minh cao cấp với chip A17 Pro',
            price: 29990000,
            originalPrice: 32990000,
            image: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
            images: [
              'https://via.placeholder.com/300x300?text=iPhone+15+Pro+1',
              'https://via.placeholder.com/300x300?text=iPhone+15+Pro+2'
            ],
            categoryId: 1,
            stock: 15,
            featured: true,
            rating: 4.8,
            reviews: 234
          },
          {
            id: 2,
            name: 'Samsung Galaxy S24',
            description: 'Flagship Android với AI tiên tiến',
            price: 22990000,
            originalPrice: 24990000,
            image: 'https://via.placeholder.com/300x300?text=Galaxy+S24',
            images: [
              'https://via.placeholder.com/300x300?text=Galaxy+S24+1',
              'https://via.placeholder.com/300x300?text=Galaxy+S24+2'
            ],
            categoryId: 1,
            stock: 20,
            featured: true,
            rating: 4.6,
            reviews: 156
          },
          {
            id: 3,
            name: 'MacBook Air M3',
            description: 'Laptop siêu mỏng với chip M3 mạnh mẽ',
            price: 32990000,
            originalPrice: 35990000,
            image: 'https://via.placeholder.com/300x300?text=MacBook+Air+M3',
            images: [
              'https://via.placeholder.com/300x300?text=MacBook+Air+M3+1',
              'https://via.placeholder.com/300x300?text=MacBook+Air+M3+2'
            ],
            categoryId: 2,
            stock: 8,
            featured: false,
            rating: 4.9,
            reviews: 89
          },
          {
            id: 4,
            name: 'iPad Pro 12.9"',
            description: 'Máy tính bảng chuyên nghiệp với màn hình Liquid Retina',
            price: 25990000,
            originalPrice: 27990000,
            image: 'https://via.placeholder.com/300x300?text=iPad+Pro',
            images: [
              'https://via.placeholder.com/300x300?text=iPad+Pro+1',
              'https://via.placeholder.com/300x300?text=iPad+Pro+2'
            ],
            categoryId: 3,
            stock: 12,
            featured: true,
            rating: 4.7,
            reviews: 167
          },
          {
            id: 5,
            name: 'AirPods Pro 2',
            description: 'Tai nghe không dây với chống ồn chủ động',
            price: 6490000,
            originalPrice: 6990000,
            image: 'https://via.placeholder.com/300x300?text=AirPods+Pro+2',
            images: [
              'https://via.placeholder.com/300x300?text=AirPods+Pro+2+1',
              'https://via.placeholder.com/300x300?text=AirPods+Pro+2+2'
            ],
            categoryId: 4,
            stock: 25,
            featured: false,
            rating: 4.5,
            reviews: 312
          },
          {
            id: 6,
            name: 'Apple Watch Series 9',
            description: 'Đồng hồ thông minh với GPS và LTE',
            price: 9990000,
            originalPrice: 10990000,
            image: 'https://via.placeholder.com/300x300?text=Apple+Watch+S9',
            images: [
              'https://via.placeholder.com/300x300?text=Apple+Watch+S9+1',
              'https://via.placeholder.com/300x300?text=Apple+Watch+S9+2'
            ],
            categoryId: 4,
            stock: 18,
            featured: true,
            rating: 4.6,
            reviews: 145
          }
        ]
      } catch (error) {
        this.error = error.message
        console.error('Error fetching products:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      try {
        // Mock data để demo
        this.categories = [
          { id: 1, name: 'Điện thoại', icon: 'smartphone', color: '#e91e63' },
          { id: 2, name: 'Laptop', icon: 'laptop', color: '#2196f3' },
          { id: 3, name: 'Tablet', icon: 'tablet', color: '#ff9800' },
          { id: 4, name: 'Phụ kiện', icon: 'headphones', color: '#4caf50' }
        ]
      } catch (error) {
        this.error = error.message
        console.error('Error fetching categories:', error)
      }
    },

    async fetchProductById(id) {
      this.loading = true
      try {
        // Trong thực tế sẽ gọi API
        this.currentProduct = this.getProductById(id)
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    setCurrentProduct(product) {
      this.currentProduct = product
    },

    clearCurrentProduct() {
      this.currentProduct = null
    },

    async updateProduct(productData) {
      this.loading = true
      this.error = null
      try {
        // Trong môi trường development, giả lập cập nhật sản phẩm
        if (import.meta.env.DEV) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          const index = this.products.findIndex(p => p.id === productData.id)
          if (index !== -1) {
            this.products[index] = {
              ...this.products[index],
              ...productData
            }
          }
          return this.products[index]
        }

        // Trong môi trường production, gọi API thật
        const response = await api.put(`/products/${productData.id}`, productData)
        const updatedProduct = response.data
        const index = this.products.findIndex(p => p.id === updatedProduct.id)
        if (index !== -1) {
          this.products[index] = updatedProduct
        }
        return updatedProduct
      } catch (error) {
        this.error = error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm'
        throw error
      } finally {
        this.loading = false
      }
    },

    async addProduct(productData) {
      this.loading = true
      this.error = null
      try {
        // Trong môi trường development, giả lập thêm sản phẩm
        if (import.meta.env.DEV) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          const newProduct = {
            id: this.products.length + 1,
            name: productData.get('name'),
            price: Number(productData.get('price')),
            categoryId: Number(productData.get('categoryId')),
            description: productData.get('description'),
            image: URL.createObjectURL(productData.get('image')),
            images: [],
            stock: 10,
            featured: false,
            rating: 0,
            reviews: 0
          }
          this.products.unshift(newProduct)
          return newProduct
        }

        // Trong môi trường production, gọi API thật
        const response = await api.post('/products', productData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        const newProduct = response.data
        this.products.unshift(newProduct)
        return newProduct
      } catch (error) {
        this.error = error.message || 'Có lỗi xảy ra khi thêm sản phẩm'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

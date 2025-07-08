import { defineStore } from 'pinia'

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    env: null,
    tenantId: null,
    tenantName: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.env && !!state.tenantId,
    tenantInfo: (state) => ({
      env: state.env,
      tenantId: state.tenantId,
      tenantName: state.tenantName
    })
  },
  
  actions: {
    setTenantInfo(tenant) {
      this.env = tenant.env
      this.tenantId = tenant.tenant_id
      this.tenantName = tenant.tenant_name
      
      // Lưu vào localStorage để persist qua các session
      localStorage.setItem('tenant_env', tenant.env)
      localStorage.setItem('tenant_id', tenant.tenant_id)
      localStorage.setItem('tenant_name', tenant.tenant_name)
      
      console.log('Tenant info saved:', { env: this.env, tenantId: this.tenantId })
    },
    
    loadFromStorage() {
      this.env = localStorage.getItem('tenant_env')
      this.tenantId = localStorage.getItem('tenant_id')
      this.tenantName = localStorage.getItem('tenant_name')
      
      if (this.env) {
        console.log('Tenant info loaded from storage:', { env: this.env, tenantId: this.tenantId })
      }
    },
    
    clear() {
      this.env = null
      this.tenantId = null
      this.tenantName = null
      
      localStorage.removeItem('tenant_env')
      localStorage.removeItem('tenant_id')
      localStorage.removeItem('tenant_name')
      
      console.log('Tenant info cleared')
    }
  }
})

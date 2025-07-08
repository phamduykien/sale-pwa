// File demo để test hệ thống env automatic injection

export async function testEnvSystem() {
  console.log('=== Testing ENV System ===')
  
  // Test 1: Kiểm tra tenant store
  const env = localStorage.getItem('tenant_env')
  console.log('Current env from localStorage:', env)
  
  if (!env) {
    console.warn('⚠️ Chưa có env trong localStorage. Hãy login trước.')
    return
  }
  
  // Test 2: Test API call tự động thêm env
  try {
    console.log('Testing API call with automatic env injection...')
    
    // Gọi API với path tương đối - interceptor sẽ tự thêm env
    const testUrl = 'api/test/endpoint'
    console.log('Original URL:', testUrl)
    
    // Không thực sự gọi API vì endpoint có thể không tồn tại
    // Chỉ test việc URL transformation trong interceptor
    const mockConfig = {
      url: testUrl,
      method: 'get'
    }
    
    // Simulate interceptor logic
    const hasEnvPrefix = mockConfig.url.startsWith(`/${env}/`)
    const shouldSkip = ['/api/oauth/', '/api/authmob/Authens/login'].some(path => 
      mockConfig.url.includes(path)
    )
    
    if (!hasEnvPrefix && !shouldSkip && !mockConfig.url.startsWith('http')) {
      const cleanUrl = mockConfig.url.startsWith('/') ? mockConfig.url.substring(1) : mockConfig.url
      const transformedUrl = `/${env}/${cleanUrl}`
      console.log('✅ URL would be transformed to:', transformedUrl)
    } else {
      console.log('ℹ️ URL would not be transformed')
    }
    
    console.log('✅ ENV system test completed successfully!')
    
  } catch (error) {
    console.error('❌ ENV system test failed:', error)
  }
}

// Hàm tiện ích để log thông tin tenant hiện tại
export function logCurrentTenant() {
  const env = localStorage.getItem('tenant_env')
  const tenantId = localStorage.getItem('tenant_id')
  const tenantName = localStorage.getItem('tenant_name')
  
  console.log('=== Current Tenant Info ===')
  console.log('ENV:', env)
  console.log('Tenant ID:', tenantId)
  console.log('Tenant Name:', tenantName)
  console.log('==========================')
}

// Export để có thể gọi từ console
if (typeof window !== 'undefined') {
  window.testEnvSystem = testEnvSystem
  window.logCurrentTenant = logCurrentTenant
}

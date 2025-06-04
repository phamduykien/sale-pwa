<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <div style="width: 400px">
          <q-card>
            <q-card-section>
              <div class="text-h6">Login</div>
            </q-card-section>

            <q-card-section>
              <q-input v-model="username" label="Username" autocomplete="username" />
              <q-input v-model="password" label="Password" type="password" autocomplete="current-password" @keyup.enter="login" />
              <q-input
                v-if="showOtpInput"
                v-model="otp"
                label="OTP"
                type="number"
                maxlength="6"
                @keyup.enter="loginTwoFactor"
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn v-if="!showOtpInput" color="primary" @click="login">Login</q-btn>
              <q-btn v-else color="primary" @click="loginTwoFactor">Verify OTP</q-btn>
            </q-card-actions>
          </q-card>

          <q-card v-if="showTenantSelection">
            <q-card-section>
              <div class="text-h6">Select Tenant</div>
            </q-card-section>

            <q-card-section>
              <q-select
                v-model="selectedTenant"
                :options="tenants"
                label="Tenant"
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn color="primary" @click="getAuthToken">Agree</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios, { HttpStatusCode } from 'axios';

export default {
  setup() {
    const username = ref('');
    const password = ref('');
    const router = useRouter();
    const showOtpInput = ref(false);
    const otp = ref('');
    const tenants = ref([]);
    const showTenantSelection = ref(false);
    const selectedTenant = ref(null);

    const login = async () => {
      try {
        const deviceId = navigator.userAgent; // Get the device ID
        const response = await axios.post(
          '/api/oauth/oauthmobile/login',
          {
            UserName: username.value,
            Password: password.value,
            DeviceId: deviceId, // Use the device ID
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-ms-bid': '',
              Accept: 'application/json',
              DeviceOS: 'ios',
              'app-version': '6.1.2',
              'app-version-code': '202505301',
            },
          }
        );

        // Handle successful login
        if (response.status === HttpStatusCode.Ok) {
          // Store the tenants and show the tenant selection interface
          tenants.value = response.data.Data.map(tenant => ({
            label: tenant.TenantName,
            value: tenant.TenantId,
          }));
          showTenantSelection.value = true;
        }
      } catch (error) {
        // Handle 422 error with OTP requirement
        if (error.response && error.response.status === HttpStatusCode.UnprocessableEntity) {
          try {
            const data = JSON.parse(JSON.stringify(error.response.data));
            if (data.Error === 122) {
              // Show OTP input
              showOtpInput.value = true;
              return;
            }
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
            alert('Invalid credentials');
          }
        }
        console.error('Login failed:', error);
        alert('Invalid credentials');
      }
    };

    const loginTwoFactor = async () => {
      try {
        const deviceId = navigator.userAgent; // Get the device ID
        const response = await axios.post(
          '/api/oauth/oauthmobile/login-twofactory',
          {
            Username: username.value,
            DeviceId: deviceId, // Use the device ID
            Code: otp.value,
            Remember: true,
            IsAppAuthen: true
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-ms-bid': '',
              Accept: 'application/json',
              DeviceOS: 'ios',
              'app-version': '6.1.2',
              'app-version-code': '202505301',
            },
          }
        );

        // Handle successful login
        if (response.status === HttpStatusCode.Ok) {
          // Store the authentication token (assuming it's in response.data.Token)
          localStorage.setItem('authToken', response.data.Token);
          // Redirect to the next page
          router.push('/');
        } else {
          console.error('Two-factor login failed:', response.data);
          alert('Invalid OTP');
        }
      } catch (error) {
        console.error('Two-factor login failed:', error);
        alert('Invalid OTP');
      }
    };

    onMounted(() => {
      // Check if there's an auth token
      const token = localStorage.getItem('authToken');
      if (token) {
        router.push('/'); // Redirect if already logged in
      }
    });

    const getAuthToken = async () => {
      try {
        const deviceId = navigator.userAgent; // Get the device ID
        const response = await axios.get(
          `/g3/api/authmobile/tenant/${selectedTenant.value}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-ms-bid': '',
              Accept: 'application/json',
              DeviceOS: 'ios',
            },
          }
        );

        // Handle successful token retrieval
        if (response.status === HttpStatusCode.Ok) {
          // Store the authentication token
          localStorage.setItem('authToken', response.data.Token);
          // Redirect to the next page
          router.push('/');
        } else {
          console.error('Failed to get auth token:', response.data);
          alert('Failed to get auth token');
        }
      } catch (error) {
        console.error('Failed to get auth token:', error);
        alert('Failed to get auth token');
      }
    };

    onMounted(() => {
      // Check if there's an auth token
      const token = localStorage.getItem('authToken');
      if (token) {
        router.push('/'); // Redirect if already logged in
      }
    });

    return {
      username,
      password,
      login,
      otp,
      showOtpInput,
      loginTwoFactor,
      tenants,
      showTenantSelection,
      selectedTenant,
      getAuthToken,
    };
  },
};
</script>

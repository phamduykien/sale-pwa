import { api } from 'src/boot/axios';
import { HttpStatusCode } from 'axios';
import notificationService from 'src/services/NotificationService';
import { showNotification } from 'src/boot/notify-service'
// Declare MWSClient global để TypeScript nhận diện
declare global {
  interface Window {
    MWSClient?: any;
  }
}

class MWSService {
  private sdkLoaded: boolean = false;
  private loadingPromise: Promise<boolean> | null = null;
  private isInitialized: boolean = false;

  /**
   * Lấy socket token từ API
   */
  async getSocketToken(): Promise<string | null> {
    try {
      const response = await api.get('/api/business/Websockets/token?site=1');
      if (response.status === HttpStatusCode.Ok) {
        return response.data;
      } else {
        console.error('Failed to get socket token:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Error getting socket token:', error);
      return null;
    }
  }

  /**
   * Tải MWS SDK từ CDN và eval vào ứng dụng
   */
  private async loadMWSSDK(): Promise<boolean> {
    // Nếu đã tải rồi thì trả về true
    if (this.sdkLoaded || typeof window.MWSClient !== 'undefined') {
      this.sdkLoaded = true;
      return true;
    }

    // Nếu đang trong quá trình tải thì đợi
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    console.log('Đang tải MWS SDK từ CDN...');

    this.loadingPromise = new Promise(async (resolve) => {
      try {
        const response = await fetch('https://amisplatform.misacdn.net/vendor/mws/mws.client-3.0.0.all.min.js');
        if (!response.ok) {
          throw new Error(`Failed to load MWS SDK: ${response.status}`);
        }

        const scriptContent = await response.text();

        // Eval script vào global scope
        eval(scriptContent);

        // Kiểm tra xem MWSClient đã có trong window chưa
        if (typeof window.MWSClient !== 'undefined') {
          console.log('MWS SDK đã được tải và eval thành công!');
          this.sdkLoaded = true;
          resolve(true);
        } else {
          throw new Error('MWSClient không có trong window sau khi eval script');
        }
      } catch (error) {
        console.error('Lỗi khi tải MWS SDK:', error);
        this.loadingPromise = null; // Reset để có thể thử lại
        resolve(false);
      }
    });

    return this.loadingPromise;
  }

  /**
   * Đợi MWS SDK được tải
   */
  private async waitForMWSClient(): Promise<boolean> {
    // Thử tải SDK trước
    const loaded = await this.loadMWSSDK();

    if (loaded) {
      return true;
    }

    // Nếu tải không thành công, thử đợi một chút rồi kiểm tra lại
    return new Promise((resolve) => {
      const checkMWS = () => {
        if (typeof window.MWSClient !== 'undefined') {
          console.log('MWS SDK đã được tải thành công.');
          this.sdkLoaded = true;
          resolve(true);
        } else {
          console.log('Đang chờ MWS SDK được tải...');
          setTimeout(checkMWS, 200);
        }
      };
      checkMWS();
    });
  }




  /**
   * Kết nối MWS với token
   */
  async connectMWS(token?: string): Promise<boolean> {
    try {
      // Sử dụng token được truyền vào hoặc lấy từ localStorage
      const socketToken = token || localStorage.getItem('socketToken');

      if (!socketToken) {
        console.log('Không tìm thấy socketToken. Không thể kết nối MWS WebSocket.');
        return false;
      }

      if (this.isInitialized) {
        return true;
      }

      // Đợi SDK được tải
      await this.waitForMWSClient();

      if (!window.MWSClient) {
        throw new Error('MWSClient không có sẵn trong window object');
      }

      console.log('Đang khởi tạo MWS Client...');

      // Khởi tạo MWSClient theo API mới
      window.MWSClient.init({
        socketURL: "wss://mws.misa.vn",
        token: socketToken,
        socketOption: {
          // "reconnectionDelayMax": 10000,
          // "reconnectionAttempts": 5,
          // "timeout": 10000,
        },
        onConnector: (e: any) => {
          console.log('MWS WebSocket đã kết nối thành công!', e);
          this.handleConnected(e);
        },
        onTokenInvalid: async (e: any) => {
          console.log('Token không hợp lệ, đang lấy token mới...', e);
          await this.handleTokenInvalid(e);
        },
        disconnect: (reason: any) => {
          console.log('MWS WebSocket đã ngắt kết nối:', reason);
          this.handleDisconnected(reason);
        },
      });

      this.isInitialized = true;
      window.MWSClient.off("hook_facebook_conversation_detail");
      window.MWSClient.off("hook_facebook");
      window.MWSClient.on("hook_facebook_conversation_detail", this.handleMessage);
      window.MWSClient.on("hook_facebook", this.handleMessage);




      return true;
    } catch (error) {
      console.error('Error connecting MWS:', error);
      return false;
    }
  }

  /**
   * Xử lý khi kết nối thành công
   */
  private handleConnected(e: any): void {
    console.log('Xử lý kết nối thành công:', e);
  }

  /**
   * Xử lý khi token không hợp lệ
   */
  private async handleTokenInvalid(e: any): Promise<void> {
    console.log('Xử lý token không hợp lệ:', e);

    try {
      // Lấy token mới
      const newToken = await this.getSocketToken();

      if (newToken) {
        // Lưu token mới
        localStorage.setItem('socketToken', newToken);

        // Reconnect với token mới
        if (window.MWSClient) {
          window.MWSClient.reconnect(newToken);
        }
      } else {
        console.error('Không thể lấy token mới');
      }
    } catch (error) {
      console.error('Lỗi khi xử lý token không hợp lệ:', error);
    }
  }

  /**
   * Xử lý khi ngắt kết nối
   */
  private handleDisconnected(reason: any): void {
    console.log('Xử lý ngắt kết nối:', reason);
    // Có thể thêm logic tự động kết nối lại ở đây
  }

  /**
   * Xử lý tin nhắn nhận được từ MWS
   */
  private handleMessage(message: any): void {
    console.log('Processing MWS message:', message);

    try {
      // Kiểm tra xem message có phải là notification không
      // if (this.isNotificationMessage(message)) {
      //   this.handleNotificationMessage(message);
      // }
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Thông báo thử nghiệm!', {
          body: 'Có socket mới',
          icon: '/icons/favicon-128x128.png', // Đảm bảo icon này tồn tại trong public/icons
          badge: '/icons/favicon-96x96.png', // Đảm bảo icon này tồn tại trong public/icons
          vibrate: [200, 100, 200],
          tag: 'test-notification', // Tag giúp gom nhóm thông báo
          data: { url: window.location.origin } // Dữ liệu kèm theo, ví dụ URL để mở khi click
        });
        showNotification('info', 'Đã gửi thông báo local. Kiểm tra thông báo của hệ thống.');
      }).catch(err => {
        console.error('Service Worker not ready or error showing notification:', err);
        showNotification('error', 'Không thể hiển thị thông báo local.');
      });

      // Xử lý các loại message khác
      // - Cập nhật trạng thái đơn hàng
      // - Tin nhắn chat
      // - Sync data
      // ...
    } catch (error) {
      console.error('Error handling MWS message:', error);
    }
  }

  /**
   * Kiểm tra xem message có phải là notification không
   */
  private isNotificationMessage(message: any): boolean {
    // Kiểm tra theo cấu trúc message từ server
    // Ví dụ: message có type là 'notification' hoặc có field 'notification'
    return true;
    //return message && (
    //   message.type === 'notification' ||
    //   message.messageType === 'notification' ||
    //   message.notification ||
    //   (message.data && message.data.notification)
    // );
  }

  /**
   * Xử lý notification message từ WebSocket
   */
  private handleNotificationMessage(message: any): void {
    try {
      // Parse notification data từ message
      let notificationData;

      if (message.notification) {
        notificationData = message.notification;
      } else if (message.data && message.data.notification) {
        notificationData = message.data.notification;
      } else {
        // Message chính là notification data
        notificationData = message;
      }

      // Chuẩn hóa notification data
      const normalizedNotification = {
        title: notificationData.title || notificationData.subject || 'Thông báo mới',
        message: notificationData.message || notificationData.body || notificationData.content || '',
        type: this.mapNotificationType(notificationData.type || notificationData.level || 'info'),
        icon: this.mapNotificationIcon(notificationData.type || notificationData.level || 'info'),
        data: {
          source: 'websocket',
          originalMessage: message,
          ...notificationData.data
        }
      };

      console.log('Handling notification from WebSocket:', normalizedNotification);

      // Gửi tới notification service để xử lý
      notificationService.handleIncomingNotification(normalizedNotification);
    } catch (error) {
      console.error('Error handling notification message:', error);
    }
  }

  /**
   * Map loại notification từ server sang loại của app
   */
  private mapNotificationType(serverType: string): string {
    const typeMap: { [key: string]: string } = {
      'success': 'success',
      'error': 'error',
      'warning': 'warning',
      'info': 'info',
      'danger': 'error',
      'alert': 'warning',
      'notice': 'info'
    };

    return typeMap[serverType?.toLowerCase()] || 'info';
  }

  /**
   * Map icon notification theo loại
   */
  private mapNotificationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'success': 'check_circle',
      'error': 'error',
      'warning': 'warning',
      'info': 'info',
      'order': 'shopping_cart',
      'payment': 'payment',
      'user': 'person',
      'system': 'settings'
    };

    return iconMap[type?.toLowerCase()] || 'notifications';
  }

  /**
   * Ngắt kết nối MWS
   */
  disconnect(): void {
    if (window.MWSClient) {
      window.MWSClient.disconnect();
      console.log('MWS WebSocket đã ngắt kết nối thủ công.');
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected(): boolean {
    return window.MWSClient && window.MWSClient.isConnected && window.MWSClient.isConnected();
  }

  /**
   * Lấy socket token và kết nối MWS
   * Được gọi sau khi đăng nhập thành công
   */
  async initializeAfterLogin(): Promise<boolean> {
    try {
      // Lấy socket token
      const socketToken = await this.getSocketToken();
      if (!socketToken) {
        return false;
      }

      // Lưu token vào localStorage
      localStorage.setItem('socketToken', socketToken);

      // Kết nối MWS
      return await this.connectMWS(socketToken);
    } catch (error) {
      console.error('Error initializing MWS after login:', error);
      return false;
    }
  }

  /**
   * Gửi tin nhắn qua MWS
   */
  sendMessage(message: any): boolean {
    if (window.MWSClient && this.isConnected()) {
      window.MWSClient.send(message);
      return true;
    } else {
      console.warn('MWS WebSocket chưa kết nối. Không thể gửi tin nhắn.');
      return false;
    }
  }

  /**
   * Reconnect với token mới
   */
  async reconnect(newToken?: string): Promise<boolean> {
    try {
      const socketToken = newToken || await this.getSocketToken();

      if (!socketToken) {
        return false;
      }

      // Lưu token mới
      localStorage.setItem('socketToken', socketToken);

      if (window.MWSClient) {
        window.MWSClient.reconnect(socketToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error reconnecting MWS:', error);
      return false;
    }
  }

  /**
   * Lấy instance MS Client
   */
  getClient(): any {
    return window.MWSClient;
  }
}

// Export singleton instance
export const mwsService = new MWSService();
export default mwsService;

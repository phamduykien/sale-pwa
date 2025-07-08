import { boot } from 'quasar/wrappers';
import mwsService from 'src/services/MWSService';

export default boot(({ app, router }) => {
  // Tự động kết nối khi ứng dụng khởi động nếu có token
  // MWS SDK được tải đồng bộ nên có thể giảm delay
  setTimeout(() => {
    const socketToken = localStorage.getItem('socketToken');
    if (socketToken) {
      mwsService.connectMWS();
    }
  }, 200);

  // Lắng nghe sự kiện đăng nhập/đăng xuất để quản lý kết nối
  router.beforeEach((to, from, next) => {
    const currentSocketToken = localStorage.getItem('socketToken');
    if (currentSocketToken && !mwsService.isConnected()) {
      mwsService.connectMWS();
    } else if (!currentSocketToken && mwsService.isConnected()) {
      mwsService.disconnect();
    }
    next();
  });

  // Đăng ký MWS Service vào global properties để có thể truy cập từ bất cứ đâu
  app.config.globalProperties.$mwsService = mwsService;
  // store.mwsService = mwsService; // Nếu bạn muốn truy cập từ Pinia store
});

export { mwsService };

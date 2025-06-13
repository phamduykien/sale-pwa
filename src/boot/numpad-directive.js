import numpadDirective from 'src/directives/numpad'

export default ({ app }) => {
  // Truyền $q vào object directive để nó có thể sử dụng sau này
  // $q sẽ có sẵn trên app.config.globalProperties.$q sau khi Quasar plugin được cài đặt
  if (app.config.globalProperties.$q) {
    numpadDirective.$q = app.config.globalProperties.$q;
  } else {
    // Fallback nếu $q chưa có ngay, mặc dù với boot order, nó nên có
    // Điều này ít có khả năng xảy ra nếu boot file của Quasar chạy trước
    console.warn('Numpad Directive Boot: $q not found on app.config.globalProperties. Numpad platform check might fail.');
    // Cung cấp một đối tượng $q giả lập tối thiểu để tránh lỗi runtime nếu $q không tồn tại
    numpadDirective.$q = {
      platform: {
        is: {
          mobile: false // Mặc định là không phải mobile nếu không tìm thấy $q thật
        }
      }
    };
  }
  app.directive('numpad', numpadDirective)
}

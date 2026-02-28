/**
 * 全局应用配置 (app.config.js)
 * 这里配置小程序的 pages 路由列表、全局 window 表现以及底部 tabBar
 */
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/discover/index',
    'pages/ai/index',
    'pages/favorites/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '恋爱话术库',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#9ca3af',
    selectedColor: '#ec4899',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'static/tabbar/home.png',
        selectedIconPath: 'static/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/discover/index',
        text: '话术库',
        iconPath: 'static/tabbar/discover.png',
        selectedIconPath: 'static/tabbar/discover-active.png'
      },
      {
        pagePath: 'pages/ai/index',
        text: 'AI',
        iconPath: 'static/tabbar/ai.png',
        selectedIconPath: 'static/tabbar/ai-active.png'
      },
      {
        pagePath: 'pages/favorites/index',
        text: '收藏',
        iconPath: 'static/tabbar/favorites.png',
        selectedIconPath: 'static/tabbar/favorites-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'static/tabbar/profile.png',
        selectedIconPath: 'static/tabbar/profile-active.png'
      }
    ]
  }
})

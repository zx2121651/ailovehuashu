/**
 * src/app.js
 * 整个 Taro 应用的入口文件。
 * 这里不应放置具体的页面逻辑，主要用于挂载生命周期或者全局 Provider 等。
 */
import { Component } from 'react'
import './app.scss'

class App extends Component {
  componentDidMount() {
    // 应用启动生命周期
  }

  // this.props.children 是将要被渲染的页面
  render() {
    return this.props.children
  }
}

export default App

import { Component, type ErrorInfo, type ReactNode } from "react";
import styles from "./AppErrorBoundary.module.css";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error?: Error;
};

const appStorageKeys = [
  "game-asset-forge.assets",
  "game-asset-forge.params",
  "game-asset-forge.project-settings",
];

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed", error, info);
  }

  private resetLocalData = () => {
    appStorageKeys.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className={styles.page}>
        <section className={styles.panel}>
          <p className={styles.kicker}>Game Asset Forge</p>
          <h1>页面遇到异常</h1>
          <p>
            可能是浏览器本地缓存、图片数据或扩展脚本导致的临时问题。可以清理本项目缓存后重新进入。
          </p>
          <pre>{this.state.error.message}</pre>
          <div className={styles.actions}>
            <button type="button" onClick={() => window.location.reload()}>
              刷新页面
            </button>
            <button type="button" onClick={this.resetLocalData}>
              清理缓存并重试
            </button>
          </div>
        </section>
      </main>
    );
  }
}

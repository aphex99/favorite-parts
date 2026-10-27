import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unexpected application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container py-3" role="alert">
          <h1>Что-то пошло не так</h1>
          <p>Перезагрузите страницу, чтобы попробовать снова</p>
          <button type="button" onClick={() => window.location.reload()}>
            Перезагрузить страницу
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

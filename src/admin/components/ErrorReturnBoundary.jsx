import { Component } from "react";

export default class ErrorReturnBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentDidCatch() {
    this.showPopupAndReturn();
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleWindowError = () => {
    this.showPopupAndReturn();
  };

  handleUnhandledRejection = () => {
    this.showPopupAndReturn();
  };

  showPopupAndReturn = () => {
    if (this.isReturning) return;
    this.isReturning = true;
    window.alert("Something went wrong");
    window.setTimeout(() => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/admin";
      }
    }, 0);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 text-sm text-muted-foreground">
          Something went wrong. Returning...
        </div>
      );
    }

    return this.props.children;
  }
}

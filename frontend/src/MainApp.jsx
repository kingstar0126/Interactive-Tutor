import { useRoutes } from "react-router-dom";
import { AppRoutes } from "./routes";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ThemeProvider } from "@material-tailwind/react";
import "./styles/App.css";

function MainApp() {
  const pages = useRoutes(AppRoutes);

  return (
    <ThemeProvider>
      <Provider className="App" store={store}>
        {pages}
      </Provider>
    </ThemeProvider>
  );
}

export default MainApp;

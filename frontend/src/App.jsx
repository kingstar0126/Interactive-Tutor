import { useRoutes } from "react-router-dom";
import {AppRoutes, AppRoutes_login} from "./routes";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import "./App.css";

function App() {
  const pages = useRoutes(AppRoutes);
  return (
    <Provider className="App" store={store}>
      {pages}
    </Provider>
  );
}

export default App;

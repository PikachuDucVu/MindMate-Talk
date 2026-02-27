import { getSystemInfo } from "zmp-sdk";
import {
  AnimationRoutes,
  App as ZMPApp,
  Route,
  SnackbarProvider,
  ZMPRouter,
} from "zmp-ui";
import { AppProps } from "zmp-ui/app";

import App from "@/MindMateApp";

const Layout = () => {
  return (
    <ZMPApp theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
      <SnackbarProvider>
        <ZMPRouter>
          <AnimationRoutes>
            <Route path="/" element={<App />}></Route>
          </AnimationRoutes>
        </ZMPRouter>
      </SnackbarProvider>
    </ZMPApp>
  );
};
export default Layout;

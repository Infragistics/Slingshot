import 'bootstrap/dist/css/bootstrap.css';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import MainView from "./views/MainView";

initializeIcons();

let isOfficeInitialized = false;

const title = "Slingshot Task Pane Add-in";

const render = Component => {
	ReactDOM.render(
		<AppContainer>
			<Component title={title} isOfficeInitialized={isOfficeInitialized} />
		</AppContainer>,
		document.getElementById("container")
	);
};

/* Render application after Office initializes */
Office.initialize = () => {
	isOfficeInitialized = true;

	document.addEventListener("DOMContentLoaded", function (_event) {
		Office.context.mailbox.addHandlerAsync(Office.EventType.ItemChanged, itemChanged);

		UpdateTaskPaneUI(Office.context.mailbox.item);
	});

	render(MainView);
};

if ((module as any).hot) {
	(module as any).hot.accept("./views/MainView", () => {
		const NextApp = require("./views/MainView").default;
		render(NextApp);
	});
}

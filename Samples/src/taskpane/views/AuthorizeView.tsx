import * as React from "react";
import { isNullOrUndefined } from "../helpers/helpers";

export interface AuthorizeViewProps {
	message: string;
	errorMessage: string;
	onSubmit: Function;
}

export default class AuthorizeView extends React.Component<AuthorizeViewProps> {
	state = {
		token: ""
	}
	render() {
		const { message, errorMessage, onSubmit } = this.props;

		return (
			<div className="inputContainerVertical mainAppContainer">
				<label htmlFor="authorizeInputRefId" className="inputLabel">{message}</label>
				<input id="authorizeInputRefId" value={this.state.token} onChange={(newValue) => { this.setState({ token: newValue.currentTarget.value }) }} />
				<button type="submit" className="fullWidth createTaskButton" title="main button" onClick={() => { onSubmit(this.state.token) }} >
					Authorize
				</button>
				{
					isNullOrUndefined(errorMessage) ? null :
						<div className="inputContainerVertical">
							<p style={{ color: "#cc0000" }}>{errorMessage}</p>
						</div>
				}
			</div>
		);
	}
}

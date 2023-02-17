import * as React from "react";
import { formatDateYYYYMMDD, isNullOrUndefined, isNullOrUndefinedOrEmptyString } from "../helpers/helpers";

interface TaskCreationComponentProps {
	shouldDisplay: boolean
	onChange: (taskContent: TaskCreationComponentState) => void
}

export interface TaskCreationComponentState {
	name?: string,
	description?: string,
	status?: string,
	priority?: string,
	startDate?: Date,
	dueDate?: Date
}

export default class TaskCreationComponent extends React.Component<TaskCreationComponentProps, TaskCreationComponentState> {

	constructor(props: TaskCreationComponentProps, context: any) {
		super(props, context);

		this.state = {
			name: "",
			description: "",
			status: "open",
			priority: "none",
			startDate: undefined,
			dueDate: undefined
		}


		this.authorizeAndReadItem()
	}

	componentDidUpdate(_prevProps: Readonly<TaskCreationComponentProps>, _prevState: Readonly<TaskCreationComponentState>, _snapshot?: any): void {
		if (
			_prevState.name !== this.state.name ||
			_prevState.description !== this.state.description ||
			_prevState.status !== this.state.status ||
			_prevState.priority !== this.state.priority ||
			_prevState.startDate !== this.state.startDate ||
			_prevState.dueDate !== this.state.dueDate
		) {
			this.props.onChange(this.state)
		}
	}

	authorizeAndReadItem() {
		var stateUpdate: TaskCreationComponentState = {}
		var readItemCallback = this.readOutlookItemWithAccessToken.bind(this)
		var callbackFromBody = this.populateFieldsFromBodyResult.bind(this)

		Office.context.mailbox.getCallbackTokenAsync({ isRest: true }, (result) => {
			readItemCallback(result.value, stateUpdate, callbackFromBody)
		})
	}

	getOutlookMessageUrl(api: boolean = true) {
		var item = Office.context.mailbox.item;

		var itemId;

		if (Office.context.mailbox.diagnostics.hostName === 'OutlookIOS') {
			// itemId is already REST-formatted.
			itemId = item.itemId;
		} else {
			// Convert to an item ID for API v2.0.
			itemId = Office.context.mailbox.convertToRestId(
				item.itemId,
				Office.MailboxEnums.RestVersion.v2_0
			);
		}

		if (api) {
			return Office.context.mailbox.restUrl + '/v2.0/me/messages/' + itemId;
		}
		else {
			return Office.context.mailbox.restUrl.replace("/api", "") + '/mail/inbox/id/' + itemId;
		}
	}

	readOutlookItemWithAccessToken(accessToken: string, stateUpdate: TaskCreationComponentState, callback: Function) {
		var messageUrl = this.getOutlookMessageUrl();

		fetch(messageUrl, {
			headers: { 'Authorization': 'Bearer ' + accessToken }
		})
			.then(r => r.json())
			.then((result) => {

				// populate task importance
				var importance = result.Importance
				switch (importance) {
					case "High":
						stateUpdate.priority = "high"
						break;
					case "Normal":
						stateUpdate.priority = "medium"
						break;
					case "Low":
						stateUpdate.priority = "low"
						break;
					default:
						break;
				}

				Office.context.mailbox.item.body.getAsync(Office.CoercionType.Text, (bodyResult) => {
					callback(bodyResult, stateUpdate, result.WebLink)
				})
			});

	}

	populateFieldsFromBodyResult(outlookItemBody: any, stateUpdate: TaskCreationComponentState, webLink: string) {
		var item = Office.context.mailbox.item;

		// populate task name from the subject line
		if (!isNullOrUndefined(item.normalizedSubject)) {
			stateUpdate.name = item.normalizedSubject;
		}
		else if (!isNullOrUndefined(item.subject)) {
			stateUpdate.name = item.subject;
		}

		// populate task description from the item body
		if (!isNullOrUndefined(outlookItemBody.value)) {
			stateUpdate.description = outlookItemBody.value
		}

		// populate task start and end date if any
		if (!isNullOrUndefined(item.start)) {
			stateUpdate.startDate = new Date(item.start)
		}
		else
		{
			stateUpdate.startDate = new Date(Date.now())
		}
		if (!isNullOrUndefined(item.end)) {
			stateUpdate.dueDate = new Date(item.end)
		}

		// tag the description as "From email"
		if (isNullOrUndefined(stateUpdate.description)) {
			stateUpdate.description = "From email: " + webLink
		}
		else {
			stateUpdate.description = stateUpdate.description + "\n\nFrom Email: " + webLink
		}

		// set default status
		stateUpdate.status = "open"

		// set the state to render the populated task info
		this.setState(stateUpdate)

		// notify parent for change
		this.props.onChange(stateUpdate)
	}

	render() {
		if (!this.props.shouldDisplay) {
			return null;
		}

		return (
			<div className="inputContainerVertical">
				<div>
					<h3>What should it include?</h3>
				</div>
				<div className="inputContainerVertical">
					<label htmlFor="nameInputRefId" className="inputLabel">Name</label>
					<input
						id="nameInputRefId"
						type="text"
						placeholder="Name your task"
						value={this.state.name}
						onChange={(_e) => { this.setState({ name: _e.target.value }) }}
						aria-autocomplete="none"
					/>
				</div>
				<div className="inputContainerVertical">
					<label htmlFor="descriptionInputRefId" className="inputLabel">Description</label>
					<textarea
						id="descriptionInputRefId"
						rows={10}
						placeholder="Add description..."
						value={this.state.description}
						onChange={(_e) => { this.setState({ description: _e.target.value }) }}
						aria-autocomplete="none"
					/>
				</div>
				<div className="inputContainerHorizontal">
					<div className="inputContainerVertical">
						<label htmlFor="statusInputRefId" className="inputLabel">Status</label>
						<select
							id="statusInputRefId"
							placeholder="Select status..."
							value={this.state.status}
							onChange={(_e) => { this.setState({ status: _e.target.value }) }}
							aria-autocomplete="none"
						>
							<option value="open">Open</option>
							<option value="progress">Progress</option>
							<option value="review">Review</option>
							<option value="blocked">Blocked</option>
							<option value="completed">Completed</option>
						</select>
					</div>
					<div className="inputContainerVertical">
						<label htmlFor="priorityInputRefId" className="inputLabel">Priority</label>
						<select
							id="priorityInputRefId"
							placeholder="Select priority..."
							value={this.state.priority}
							onChange={(_e) => { this.setState({ priority: _e.target.value }) }}
							aria-autocomplete="none"
						>
							<option value="none">None</option>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</div>
				</div>
				<div className="inputContainerHorizontal">
					<div className="inputContainerVertical">
						<label htmlFor="startDateInputRefId" className="inputLabel">Start Date</label>
						<input
							id="startDateInputRefId"
							type="date"
							placeholder="Select a start date..."
							max={isNullOrUndefined(this.state.dueDate) ? null : formatDateYYYYMMDD(this.state.dueDate)}
							value={isNullOrUndefinedOrEmptyString(this.state.startDate) ? "" : formatDateYYYYMMDD(this.state.startDate)}
							onChange={(_e) => { this.setState({ startDate: isNullOrUndefinedOrEmptyString(_e.target.value) ? null : new Date(_e.target.value.replace(/-/g, '\/')) }) }}
							aria-autocomplete="none"
						/>
					</div>
					<div className="inputContainerVertical">
						<label htmlFor="dueDateInputRefId" className="inputLabel">Due Date</label>
						<input
							id="dueDateInputRefId"
							type="date"
							placeholder="Select a due date..."
							min={isNullOrUndefined(this.state.startDate) ? null : formatDateYYYYMMDD(this.state.startDate)}
							value={isNullOrUndefinedOrEmptyString(this.state.dueDate) ? "" : formatDateYYYYMMDD(this.state.dueDate)}
							onChange={(_e) => { this.setState({ dueDate: isNullOrUndefinedOrEmptyString(_e.target.value) ? null : new Date(_e.target.value.replace(/-/g, '\/')) }) }}
							aria-autocomplete="none"
						/>
					</div>
				</div>
			</div>
		);
	}
}  
import * as React from "react";
import { DocumentInfo, TaskList } from "../../models";
import { IAuthorizationHeader } from "../../models/AuthorizationHeader";
import { BaseUri, ProjectKey, UserKey, WorkspaceKey } from "../helpers/constants";
import { isNullOrUndefined } from "../helpers/helpers";
import { CreatingNameOnlyComponent } from "./CreatingNameOnlyComponent";

interface TaskListSelectionComponentProps {
	parent: DocumentInfo;
	authorizationHeader: IAuthorizationHeader;
	onChange: (taskList: TaskList) => void;
	onError: (errorMessage: string) => void;
}

interface TaskListSelectionComponentState {
	lists: TaskList[];
	selectedList: TaskList;
	creatingList: boolean;
	newListName: string;
}

export default class TaskListSelectionComponent extends React.Component<TaskListSelectionComponentProps, TaskListSelectionComponentState> {
	constructor(props, context) {
		super(props, context)

		this.state = {
			lists: null,
			selectedList: null,
			creatingList: false,
			newListName: null
		};

		this.getLists = this.getLists.bind(this);
		this.createList = this.createList.bind(this);
		this.shouldDisplayListPicker = this.shouldDisplayListPicker.bind(this);
	}

	componentDidMount() {
		if (!isNullOrUndefined(this.props.parent?.id)) {
			this.getLists();
		}
	}

	componentDidUpdate(_prevProps: Readonly<TaskListSelectionComponentProps>, _prevState: Readonly<TaskListSelectionComponentState>, _snapshot?: any) {
		if (!isNullOrUndefined(this.props.parent?.id) && (isNullOrUndefined(_prevProps.parent?.id) || (!isNullOrUndefined(_prevProps.parent?.id) && this.props.parent.id !== _prevProps.parent.id))) {
			this.setState({ lists: null, selectedList: null });
			this.getLists();
		}

		if (isNullOrUndefined(this.props.parent?.id) && !isNullOrUndefined(this.state.lists)) {
			this.setState({ lists: null, selectedList: null });
		}

		if (!isNullOrUndefined(this.state.lists) && !isNullOrUndefined(this.state.lists[0]) && isNullOrUndefined(this.state.selectedList)) {
			this.setState({ selectedList: this.state.lists[0] });
		}

		if (!isNullOrUndefined(this.state.selectedList?.id) && (isNullOrUndefined(_prevState.selectedList?.id) || _prevState.selectedList.id != this.state.selectedList.id)) {
			this.props.onChange(this.state.selectedList);
		}

		if (!isNullOrUndefined(_prevState.selectedList?.id) && isNullOrUndefined(this.state.selectedList?.id)) {
			this.props.onChange(null);
		}
	}

	getLists() {
		fetch(BaseUri + "/tasklists/parent/" + this.props.parent.id, this.props.authorizationHeader)
			.then(r => r.json())
			.then(data => {
				if (isNullOrUndefined(data) || isNullOrUndefined(data.items)) {
					this.props.onError("Problems retrieving lists from Slingshot");
				}
				else {
					this.setState({ lists: data?.items as TaskList[] });
				}
			});
	}

	createList() {
		let body = {
			name: this.state.newListName
		};

		let parentObj = { id: this.props.parent.id, name: this.props.parent.name };

		switch (this.props.parent.type) {
			case UserKey:
				body["user"] = parentObj;
				break;
			case WorkspaceKey:
				body["workspace"] = parentObj;
				break;
			case ProjectKey:
				body["project"] = parentObj;
				break;
			default:
				this.props.onError("unknown parent");
				break;
		}

		fetch(BaseUri + "/tasklists/", {
			method: "POST",
			headers: {
				...this.props.authorizationHeader.headers,
				"Content-type": "application/json; charset=UTF-8"
			},
			body: JSON.stringify(body)
		})
			.then(r => r.json())
			.then(data => data as TaskList)
			.then((newList) => {
				if (isNullOrUndefined(newList) || isNullOrUndefined(newList)) {
					this.props.onError("Problems creating list in Slingshot");
				}
				else {
					this.getLists();
					this.setState({ selectedList: newList, creatingList: false, newListName: null });
				}
			})
			.catch(() => this.props.onError("Problems creating list in Slingshot"));
	}

	shouldDisplayListPicker() {
		if (!isNullOrUndefined(this.state.lists) && this.state.lists.length > 0) {
			return true;
		}
		return false;
	}

	render() {
		if (isNullOrUndefined(this.state.lists)) {
			return null;
		}

		return (
			<div className="inputContainerVertical">
				<label htmlFor="taskListInputRefId" className="inputLabel">Task List</label>

				{!this.shouldDisplayListPicker() ?
					<label>No Lists found...</label>
					:
					<select
						id="taskListInputRefId"
						placeholder="Select a task list"
						value={this.state.selectedList?.id}
						onChange={(_e) => {
							this.setState({ selectedList: this.state.lists.find(l => l.id == _e.target.value) })
						}}
						aria-autocomplete="none"
					>
						{this.state.lists?.map((option, _index) =>
							<option key={option.id} value={option.id}>
								{option.name}
							</option>
						)}
					</select>
				}

				<CreatingNameOnlyComponent
					isDisplayingCreateView={this.state.creatingList}
					toggleIsDisplayingCreateView={() => this.setState({ creatingList: !this.state.creatingList })}
					itemBeingCreatedName="List"
					name={this.state.newListName}
					nameSetter={(text: string) => this.setState({ newListName: text })}
					nameMaxLength={100}
					nameMinLength={1}
					onCreate={this.createList}
				/>
			</div>
		);
	}
}  
import * as React from "react";
import { TaskList, TaskSection, User, Workspace } from "../../models";
import { IAuthorizationHeader } from "../../models/AuthorizationHeader";
import { DocumentInfo } from "../../models/interfaces/IDocumentInfo";
import { BaseUri, LastSelectedGroupKey, LastSelectedListKey, LastSelectedSectionKey, ProjectKey, TaskListKey, TaskSectionKey, UserKey, WorkspaceKey } from "../helpers/constants";
import { isNullOrUndefined } from "../helpers/helpers";
import { getRoamingSetting, saveRoamingSettings, setRoamingSetting } from "../helpers/roamingSettings";
import TaskListSelectionComponent from "./TaskListSelectionComponent";
import TaskSectionSelectionComponent from "./TaskSectionSelectionComponent";
import WorkspacesSelectionComponent from "./WorkspacesSelectionComponent";

interface ParentPickerComponentProps {
	authorizationHeader: IAuthorizationHeader;
	onChange: (e: any) => void;
	onError: (errorMessage: string) => void;
}

interface ParentPickerComponentState {
	isPersonal: boolean,
	selectedGroup: DocumentInfo,
	selectedList: TaskList,
	selectedSection: TaskSection,

	user: User,
	workspaces: Workspace[],
	lists: TaskList[],
	sections: TaskSection[],

	creatingList: boolean,
	newListName: string,

	creatingSection: boolean,
	newSectionName: string
}

export default class ParentPickerComponent extends React.Component<ParentPickerComponentProps, ParentPickerComponentState> {
	constructor(props, context) {
		super(props, context);

		this.state = {
			isPersonal: false,
			selectedGroup: null,
			selectedList: null,
			selectedSection: null,
			user: null,
			workspaces: null,
			lists: null,
			sections: null,
			creatingList: false,
			newListName: null,
			creatingSection: false,
			newSectionName: null
		};

		this.restoreLastSavedState = this.restoreLastSavedState.bind(this);
	}

	componentDidMount() {
		this.restoreLastSavedState();
		this.getUser(false);
		this.getWorkspaces();
		if (!isNullOrUndefined(this.state.selectedGroup)) {
			this.getLists();
		}
	}

	async restoreLastSavedState() {
		var stateObject = {
			selectedGroup: null,
			selectedList: null,
			selectedSection: null
		};

		var selectedGroup = getRoamingSetting(LastSelectedGroupKey) as DocumentInfo;
		var selectedList = getRoamingSetting(LastSelectedListKey) as TaskList;
		var selectedSection = getRoamingSetting(LastSelectedSectionKey) as TaskSection;

		if (!isNullOrUndefined(selectedGroup)) {
			stateObject.selectedGroup = selectedGroup;
		}

		if (!isNullOrUndefined(selectedList)) {
			stateObject.selectedList = selectedList;
		}

		if (!isNullOrUndefined(selectedSection)) {
			stateObject.selectedSection = selectedSection;
			this.props.onChange(selectedSection);
		}

		if (isNullOrUndefined(selectedGroup)) {
			stateObject.selectedList = null;
			stateObject.selectedSection = null;
			setRoamingSetting(LastSelectedListKey, null);
			setRoamingSetting(LastSelectedSectionKey, null);
			saveRoamingSettings();
		}

		this.setState(stateObject);
	}

	componentDidUpdate(_prevProps: Readonly<ParentPickerComponentProps>, _prevState: Readonly<ParentPickerComponentState>, _snapshot?: any): void {
		let changed = false

		if (this.state.selectedGroup?.id !== _prevState.selectedGroup?.id && !isNullOrUndefined(this.state.selectedGroup)) {
			setRoamingSetting(LastSelectedGroupKey, this.state.selectedGroup);
			changed = true;

			this.getLists();
		}

		if (this.state.selectedList?.id !== _prevState.selectedList?.id && !isNullOrUndefined(this.state.selectedList)) {
			setRoamingSetting(LastSelectedListKey, new DocumentInfo(this.state.selectedList.id, this.state.selectedList.name, TaskListKey));
			changed = true;
		}

		if (this.state.selectedSection?.id !== _prevState.selectedSection?.id && !isNullOrUndefined(this.state.selectedSection)) {
			setRoamingSetting(LastSelectedSectionKey, new DocumentInfo(this.state.selectedSection.id, this.state.selectedSection.name, TaskSectionKey));
			changed = true;
		}

		if (changed) {
			saveRoamingSettings();
		}
	}

	togglePersonal() {
		if (this.state.isPersonal) {
			this.setState({
				isPersonal: false,
				selectedGroup: null,
				selectedList: null,
				selectedSection: null,
				lists: null,
				sections: null
			});
			this.getWorkspaces();
		}
		else {
			this.setState({
				isPersonal: true,
				selectedGroup: null,
				selectedList: null,
				selectedSection: null,
				lists: null,
				sections: null
			});
			this.getUser();
		}
	}

	getUser(setSelected: boolean = true) {
		fetch(BaseUri + "/user", this.props.authorizationHeader)
			.then(r => r.json())
			.then(data => {
				if (isNullOrUndefined(data)) {
					this.props.onError("Problems retrieving user information from Slingshot");
				}
				else {
					if (setSelected) {
						this.setState({ user: data as User, selectedGroup: new DocumentInfo(data.id, data.name, UserKey) });
					}
					else {
						this.setState({ user: data as User });
					}
				}
			});
	}

	getWorkspaces() {
		fetch(BaseUri + "/workspaces", this.props.authorizationHeader)
			.then(r => r.json())
			.then(data => {
				if (isNullOrUndefined(data) || isNullOrUndefined(data.items)) {
					this.props.onError("Problems retrieving workspaces from Slingshot");
				}
				else {
					this.setState({ workspaces: data.items as Workspace[] })
				}
			});
	}

	getLists() {
		fetch(BaseUri + "/tasklists/parent/" + this.state.selectedGroup.id, this.props.authorizationHeader)
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

		let parentObj = { id: this.state.selectedGroup.id, name: this.state.selectedGroup.name };

		switch (this.state.selectedGroup.type) {
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
			.then(tl => tl as TaskList)
			.then((data) => {
				if (isNullOrUndefined(data) || isNullOrUndefined(data)) {
					this.props.onError("Problems creating list in Slingshot");
				}
				else {
					this.getLists();
					this.setState({ selectedList: data, creatingList: false, newListName: null });
				}
			})
			.catch(() => this.props.onError("Problems creating list in Slingshot"));
	}

	createSection() {
		let body = {
			name: this.state.newSectionName
		};

		let parentObj = { id: this.state.selectedList.id, name: this.state.selectedList.name };

		body["taskList"] = parentObj;

		fetch(BaseUri + "/tasksections/", {
			method: "POST",
			headers: {
				...this.props.authorizationHeader.headers,
				"Content-type": "application/json; charset=UTF-8"
			},
			body: JSON.stringify(body)
		})
			.then(r => r.json())
			.then(ts => ts as TaskSection)
			.then((data) => {
				if (isNullOrUndefined(data) || isNullOrUndefined(data)) {
					this.props.onError("Problems creating section in Slingshot");
				}
				else {
					this.getLists();
					this.setState({ selectedSection: data, creatingSection: false, newSectionName: null });
				}
			})
			.catch(() => this.props.onError("Problems creating section in Slingshot"));
	}

	shouldDisplayListPicker() {
		if (!isNullOrUndefined(this.state.lists) && this.state.lists.length > 0) {
			return true;
		}
		return false;
	}

	shouldDisplaySectionPicker() {
		var list = this.state.selectedList;
		if (!isNullOrUndefined(list) && !isNullOrUndefined(list.taskSections) && list.taskSections.length !== 0) {
			if (list.taskSections.length === 1 && isNullOrUndefined(list.taskSections[0].name)) {
				list.taskSections[0].name = "Section 1";
			}
			else {
				list.taskSections.forEach((section: TaskSection) => {
					if (isNullOrUndefined(section.name)) {
						section.name = "Section 1";
					}
				});
			}

			return true;
		}
		return false;
	}

	render() {
		return (
			<div className="inputContainerVertical">
				<div>
					<h3>Where is is going?</h3>
				</div>
				<div className="inputContainerVertical">
					<div className="inputContainerHorizontal">
						<input type="checkbox" id="personalInputRefId" checked={this.state.isPersonal} onChange={this.togglePersonal.bind(this)} />
						<label htmlFor="personalInputRefId">Make it a personal task?</label>
					</div>
				</div>
				{ //WORKSPACE/PROJECT
					this.state.isPersonal ?
						null :
						<div>
							<WorkspacesSelectionComponent
								workspaces={this.state.workspaces}
								selectedId={this.state.selectedGroup?.id}
								selectedName={this.state.selectedGroup?.name}
								selectedType={this.state.selectedGroup?.type}
								onChange={(id: string, name: string, type: string) => {
									this.setState({ selectedGroup: new DocumentInfo(id, name, type), selectedList: null, selectedSection: null })
								}}
							/>
						</div>
				}
				{ //LIST
					<TaskListSelectionComponent
						parent={this.state.selectedGroup}
						authorizationHeader={this.props.authorizationHeader}
						onChange={taskList => {
							if (!isNullOrUndefined(taskList)) {
								this.setState({ selectedList: taskList });
							}
						}}
						onError={this.props.onError}
					/>
				}
				{ //SECTION
					<TaskSectionSelectionComponent
						parent={this.state.selectedList}
						authorizationHeader={this.props.authorizationHeader}
						onChange={taskSection => {
							if (!isNullOrUndefined(taskSection)) {
								this.setState({ selectedSection: taskSection });
							}
						}}
						onError={this.props.onError}
					/>
				}
			</div>
		);
	}
}





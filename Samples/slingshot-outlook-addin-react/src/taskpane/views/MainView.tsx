import * as React from "react";
import { BaseUri, TokenSettingKey } from "../helpers/constants";
import { AuthorizationHeader, DocumentInfo, MemberInfo, Organization, Project, Task, TaskList, TaskSection, Workspace } from "../../models";
import ProgressComponent from "../components/ProgressComponent";
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";
import AuthorizeView from "./AuthorizeView";
import { isNullOrUndefined, isNullOrUndefinedOrEmptyString } from "../helpers/helpers";
import TaskCreationComponent, { TaskCreationComponentState } from "../components/TaskCreationComponent";
import { getRoamingSetting, saveRoamingSettings, setRoamingSetting } from "../helpers/roamingSettings";
import AssigneePickerComponent from "../components/AssigneePickerComponent";
import ParentPickerComponent from "../components/ParentPickerComponent";

export interface MainViewProps {
	title: string;
	isOfficeInitialized: boolean;
}

export interface MainViewState {
	isAuthorized: Boolean;
	authorizationHeader: AuthorizationHeader;

	initialized: boolean;

	errorMessage: string;

	selectedGroup: DocumentInfo;
	selectedList: TaskList;
	selectedSection: TaskSection;

	workspaces: Workspace[];
	organizations: Organization[];

	assignees: string[];

	newTask: Task;
	created: boolean;
}

export default class MainView extends React.Component<MainViewProps, MainViewState> {
	constructor(props, context) {
		super(props, context);
		this.state = {
			isAuthorized: false,
			authorizationHeader: null,
			initialized: false,
			errorMessage: null,
			selectedGroup: null,
			selectedList: null,
			selectedSection: null,
			workspaces: null,
			organizations: null,
			assignees: null,
			newTask: null,
			created: false
		};

		this.setAuthorizationToken = this.setAuthorizationToken.bind(this);
		this.setError = this.setError.bind(this);
		this.taskContentChanged = this.taskContentChanged.bind(this);
		this.assigneesChanged = this.assigneesChanged.bind(this);
		this.taskSectionSelectionChanged = this.taskSectionSelectionChanged.bind(this);
		this.onCreate = this.onCreate.bind(this);
	}

	componentDidMount() {
		if (!this.state.isAuthorized || isNullOrUndefined(this.state.authorizationHeader.get())) {
			var token = getRoamingSetting(TokenSettingKey);
			if (isNullOrUndefined(token) || typeof (token) != typeof ("")) {
				this.setState({ initialized: true, isAuthorized: false });
			}
			else {
				var authorizationHeader = new AuthorizationHeader("Bearer " + token);
				this.setState({ authorizationHeader, isAuthorized: true }, () => {
					this.getOrganizations();
					this.getWorkspaces();
					this.setState({ initialized: true });
				});
			}
		}
	}

	getOrganizations() {
		fetch(BaseUri + "/organizations", this.state.authorizationHeader.get())
			.then(r => r.json())
			.then(data => {
				if (isNullOrUndefined(data) || isNullOrUndefined(data.items)) {
					this.setError("Problems retrieving organizations from Slingshot");
				}
				else {
					this.setState({ organizations: data.items as Organization[] })
				}
			});
	}

	getWorkspaces() {
		fetch(BaseUri + "/workspaces", this.state.authorizationHeader.get())
			.then(r => r.json())
			.then(data => {
				if (isNullOrUndefined(data) || isNullOrUndefined(data.items)) {
					this.setError("Problems retrieving workspaces from Slingshot");
				}
				else {
					this.setState({ workspaces: data.items as Workspace[] })
				}
			});
	}

	setAuthorizationToken = (token: string) => {
		if (!isNullOrUndefined(token)) {
			var authorizationHeader = new AuthorizationHeader("Bearer " + token);
			fetch(BaseUri + "/user", authorizationHeader.get())
				.then(r => r.json())
				.then(data => {
					if (isNullOrUndefined(data)) {
						this.setError("Problems authorizing access with this api token, try another one.");
					}
					else {
						setRoamingSetting(TokenSettingKey, token);
						saveRoamingSettings();
						this.setState({ errorMessage: null, authorizationHeader, isAuthorized: true });
					}
				})
				.catch(() => {
					this.setError("Problems authorizing access with this api token, try another one.");
				});
		}
	}

	setError = (message: string) => {
		this.setState({ errorMessage: message });
	}

	clearError() {
		this.setState({ errorMessage: null });
	}

	addTask(task: any, onSuccess?: Function, onError?: Function) {
		fetch(BaseUri + "/tasks/", this.state.authorizationHeader.post(task))
			.then(response => {
				if (response.status === 201) {
					if (!isNullOrUndefined(onSuccess)) {
						onSuccess(response)
					}
				}
				else {
					if (!isNullOrUndefined(onError)) {
						response.json()
							.then(error => {
								var firstErrorMessage = error.errors[0].message
								onError(firstErrorMessage)
							})
					}
				}
			});
	};

	onCreate() {
		var task = this.state.newTask

		var body = {
			name: task.name
		}

		if (!isNullOrUndefined(task.description)) {
			body["description"] = task.description
		}

		if (!isNullOrUndefined(task.status)) {
			body["status"] = task.status
		}

		if (!isNullOrUndefined(task.priority)) {
			body["priority"] = task.priority
		}

		if (!isNullOrUndefinedOrEmptyString(task.startDate)) {
			body["startDate"] = task.startDate
		}

		if (!isNullOrUndefinedOrEmptyString(task.dueDate)) {
			body["dueDate"] = task.dueDate
		}

		if (!isNullOrUndefined(task.taskSection)) {
			body["taskSection"] = task.taskSection
		}
		else {
			body["taskSection"] = { id: this.state.selectedSection.id, name: this.state.selectedSection.name }
		}

		if (!isNullOrUndefined(this.state.assignees) && this.state.assignees.length > 0) {
			body["assignees"] = this.state.assignees
		}

		this.addTask(body, () => this.setState({ created: true }), this.setError.bind(this));
	};

	taskSectionSelectionChanged(selectedSection: TaskSection) {
		this.setState({ selectedSection });
	}

	taskContentChanged(content: TaskCreationComponentState) {
		var task = this.state.newTask

		if (isNullOrUndefined(task)) {
			task = {
				name: content.name,
				description: content.description,
				status: content.status,
				priority: content.priority,
				startDate: content.startDate,
				dueDate: content.dueDate,
			}
		}
		else {
			task.name = content.name;
			task.description = content.description;
			task.status = content.status;
			task.priority = content.priority;
			task.startDate = content.startDate;
			task.dueDate = content.dueDate;
		}

		this.setState({ newTask: task })
	}

	assigneesChanged(listOfEmailsAssigned: string[]) {
		var assignees = this.state.assignees

		if (isNullOrUndefined(listOfEmailsAssigned) || listOfEmailsAssigned.length === 0) {
			assignees = null
		}
		else if (!isNullOrUndefined(this.state.workspaces)) {
			var listOfAssignees = []

			listOfEmailsAssigned.forEach(email => {

				var memberLinkInOrgs = this.findMemberLinksInGroupByEmail(this.state.organizations, email);
				var memberLinkInWorkspaces = this.findMemberLinksInGroupByEmail(this.state.workspaces, email);

				if (!isNullOrUndefined(memberLinkInOrgs) && !isNullOrUndefined(memberLinkInWorkspaces)) {
					listOfAssignees.push(memberLinkInOrgs);
				}
				else if (!isNullOrUndefined(memberLinkInOrgs) && isNullOrUndefined(memberLinkInWorkspaces)) {
					listOfAssignees.push(memberLinkInOrgs);
				}
				else if (isNullOrUndefined(memberLinkInOrgs) && isNullOrUndefined(memberLinkInWorkspaces)) {
					listOfAssignees.push({ email });
				}
				else if (isNullOrUndefined(memberLinkInOrgs) && !isNullOrUndefined(memberLinkInWorkspaces)) {
					listOfAssignees.push(memberLinkInWorkspaces);
				}

			})

			assignees = listOfAssignees
		}

		this.setState({ assignees })
	}

	findMemberLinksInGroupByEmail(listOfGroups: Organization[] | Workspace[] | Project[], email: string): MemberInfo {
		for (let i = 0; i < listOfGroups.length; i++) {
			var group = listOfGroups[i];

			if (!isNullOrUndefined(group.members)) {
				var memberLink = group.members.find(x => !isNullOrUndefined(x.email) && x.email.toLowerCase() === email.toLowerCase())

				if (!isNullOrUndefined(memberLink)) {
					return { id: memberLink.id, name: memberLink.name, email: memberLink.email } as MemberInfo;
				}
			}
		}

		return null;
	}

	isTaskValid() {
		if (isNullOrUndefined(this.state.selectedSection) || isNullOrUndefined(this.state.newTask) || isNullOrUndefined(this.state.newTask.name) || this.state.newTask.name === "") {
			return false;
		}
		return true;
	}

	render() {
		const { isOfficeInitialized } = this.props;

		if (!isOfficeInitialized || !this.state.initialized) {
			return (
				<div className="inputContainerVertical">
					<ProgressComponent />
				</div>
			);
		}

		if (!this.state.isAuthorized) {
			return (
				<AuthorizeView message="Please provide your API token." errorMessage={this.state.errorMessage} onSubmit={this.setAuthorizationToken} />
			);
		}

		return (
			<div className="inputContainerVertical">
				<div className="inputContainerVertical mainAppContainer">
					{
						isNullOrUndefined(this.state.errorMessage) ? null :
							<div className="inputContainerVertical">
								<p style={{ color: "#cc0000" }}>{this.state.errorMessage}</p>
							</div>
					}
					<ParentPickerComponent
						authorizationHeader={this.state.authorizationHeader.get()}
						onChange={this.taskSectionSelectionChanged}
						onError={this.setError}
					/>
					<br />
					<TaskCreationComponent
						shouldDisplay={true}
						onChange={this.taskContentChanged}
					/>
					<br />
					<AssigneePickerComponent
						shouldDisplay={false}
						onChange={this.assigneesChanged}
					/>
				</div>
				<br />
				<button type="submit" className="fullWidth createTaskButton" title="main button" disabled={!this.isTaskValid() || this.state.created} onClick={this.onCreate}>
					{this.state.created ? "Success, Task was created!" : "Create Task"}
				</button>
			</div>
		);
	}
}

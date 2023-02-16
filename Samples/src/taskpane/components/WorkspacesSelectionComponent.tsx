import * as React from "react";
import { DocumentInfo, Project, Workspace } from "../../models";
import { isNullOrUndefined, isNullOrUndefinedOrEmptyString } from "../helpers/helpers";
import { ProjectKey, WorkspaceKey } from "../helpers/constants";

interface WorkspacesSelectionComponentProps {
	workspaces: Workspace[];
	selectedId: string;
	selectedName: string;
	selectedType: string;
	onChange: (id: string, name: string, type: string) => void;
}

interface WorkspacesSelectionComponentState {
	selectedName: any;
	selectedType: any;
	selectedId: any;
}

export default class WorkspacesSelectionComponent extends React.Component<WorkspacesSelectionComponentProps, WorkspacesSelectionComponentState> {
	constructor(props, context) {
		super(props, context);

		this.state = {
			selectedName: this.props.selectedName,
			selectedType: this.props.selectedType,
			selectedId: this.props.selectedId
		}

		this.selected = this.selected.bind(this)
		this.toggleDropdown = this.toggleDropdown.bind(this)
	}

	componentDidUpdate(_prevProps: Readonly<WorkspacesSelectionComponentProps>, _prevState: Readonly<WorkspacesSelectionComponentState>, _snapshot?: any): void {
		if (this.state.selectedId !== this.props.selectedId) {
			this.selected(this.props.selectedId, this.props.selectedName, this.props.selectedType)
		}
	}

	toggleDropdown() {
		let container = document.getElementById("workspacesPickerInputLabel");
		container.scrollIntoView({ behavior: "smooth" });
		let content = document.getElementById("dropdown-content-workspaces");
		if (content.style.display == "none" || isNullOrUndefinedOrEmptyString(content.style.display)) {
			content.style.display = "block"
		}
		else {
			content.style.display = "none"
		}
	}

	selected(selectedId: string, selectedName: string, selectedType: string) {
		if (selectedId != this.state.selectedId) {
			this.setState({ selectedId, selectedName, selectedType })

			this.props.onChange(selectedId, selectedName, selectedType)
		}
	}

	getPathName(id: string): string
	{
		var name = null;

		this.props.workspaces.forEach((workspace: Workspace) => {
			if(workspace.id === id)
			{
				name = workspace.name;
			}
			else if(~isNullOrUndefined(workspace.projects))
			{
				workspace.projects.forEach((project: Project) => {
					if(project.id === id)
					{
						name = workspace.name + " -> " + project.name;
					}
				});
			}
		});

		return name;
	}

	render() {
		if (isNullOrUndefined(this.props.workspaces) || this.props.workspaces.length === 0) {
			return null;
		}

		return (
			<div className="inputContainerVertical">
				<label id="workspacesPickerInputLabel" className="inputLabel">Workspace/Project</label>

				<ul className="dropdown_container" onClick={this.toggleDropdown}>
					<li className="dropdown">
						<a className="dropbtn">{isNullOrUndefined(this.state.selectedName) ? "Select a Workspace or Project..." : this.getPathName(this.state.selectedId)}</a>
						<ul id="dropdown-content-workspaces" className="dropdown-content">
							{this.props.workspaces.map((workspace: Workspace) => {
								if (isNullOrUndefined(workspace.projects) || workspace.projects.length === 0) {
									return (
										<li key={workspace.id}>
											<a onClick={(_e) => { this.selected(workspace.id, workspace.name, WorkspaceKey) }}>{workspace.name}</a>
										</li>
									)
								}
								else {
									return (
										<li className="dropdown-sub" key={workspace.id}>
											<a onClick={(_e) => { this.selected(workspace.id, workspace.name, WorkspaceKey) }}>{workspace.name}</a>

											<ul className="dropdown-sub-list">
												{workspace.projects.map((project: DocumentInfo) => {
													return (
														<li key={project.id}>
															<a onClick={(_e) => { this.selected(project.id, project.name, ProjectKey) }}>{project.name}</a>
														</li>
													)
												})}
											</ul>
										</li>
									)
								}
							})}
						</ul>
					</li>
				</ul>

			</div>
		);
	}
}
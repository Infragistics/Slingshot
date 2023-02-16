import * as React from "react";
import { DocumentInfo, TaskSection } from "../../models";
import { IAuthorizationHeader } from "../../models/AuthorizationHeader";
import { BaseUri } from "../helpers/constants";
import { isNullOrUndefined } from "../helpers/helpers";
import { CreatingNameOnlyComponent } from "./CreatingNameOnlyComponent";

interface TaskSectionSelectionComponentProps {
	parent: DocumentInfo;
	authorizationHeader: IAuthorizationHeader;
	onChange: (TaskSection: TaskSection) => void;
	onError: (errorMessage: string) => void;
}

interface TaskSectionSelectionComponentState {
	sections: TaskSection[];
	selectedSection: TaskSection;
	creatingSection: boolean;
	newSectionName: string;
}

export default class TaskSectionSelectionComponent extends React.Component<TaskSectionSelectionComponentProps, TaskSectionSelectionComponentState> {
	constructor(props, context) {
		super(props, context)

		this.state = {
			sections: null,
			selectedSection: null,
			creatingSection: false,
			newSectionName: null
		};

		this.getSections = this.getSections.bind(this);
		this.createSection = this.createSection.bind(this);
		this.shouldDisplaySectionPicker = this.shouldDisplaySectionPicker.bind(this);
	}

	componentDidMount() {
		if (!isNullOrUndefined(this.props.parent?.id)) {
			this.getSections();
		}
	}

	componentDidUpdate(_prevProps: Readonly<TaskSectionSelectionComponentProps>, _prevState: Readonly<TaskSectionSelectionComponentState>, _snapshot?: any) {
		if (!isNullOrUndefined(this.props.parent?.id) && (isNullOrUndefined(_prevProps.parent?.id) || (!isNullOrUndefined(_prevProps.parent?.id) && this.props.parent.id !== _prevProps.parent.id))) {
			this.setState({ sections: null, selectedSection: null });
			this.getSections();
		}

		if (isNullOrUndefined(this.props.parent?.id) && !isNullOrUndefined(this.state.sections)) {
			this.setState({ sections: null, selectedSection: null });
		}

		if (!isNullOrUndefined(this.state.sections) && !isNullOrUndefined(this.state.sections[0]) && isNullOrUndefined(this.state.selectedSection)) {
			this.setState({ selectedSection: this.state.sections[0] });
		}

		if (!isNullOrUndefined(this.state.selectedSection?.id) && (isNullOrUndefined(_prevState.selectedSection?.id) || _prevState.selectedSection.id != this.state.selectedSection.id)) {
			this.props.onChange(this.state.selectedSection);
		}

		if (!isNullOrUndefined(_prevState.selectedSection?.id) && isNullOrUndefined(this.state.selectedSection?.id)) {
			this.props.onChange(null);
		}
	}

	getSections() {
		fetch(BaseUri + "/tasksections/parent/" + this.props.parent.id, this.props.authorizationHeader)
			.then(r => r.json())
			.then(data => {
				if (isNullOrUndefined(data) || isNullOrUndefined(data.items)) {
					this.props.onError("Problems retrieving sections from Slingshot");
				}
				else {
					this.setState({ sections: data?.items as TaskSection[] });
				}
			});
	}

	createSection() {
		let body = {
			name: this.state.newSectionName,
		};

		let parentObj = { id: this.props.parent.id, name: this.props.parent.name };

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
			.then(data => data as TaskSection)
			.then((newSection) => {
				if (isNullOrUndefined(newSection) || isNullOrUndefined(newSection)) {
					this.props.onError("Problems creating section in Slingshot");
				}
				else {
					this.getSections();
					this.setState({ selectedSection: newSection, creatingSection: false, newSectionName: null });
				}
			})
			.catch(() => this.props.onError("Problems creating section in Slingshot"));
	}

	shouldDisplaySectionPicker() {
		if (!isNullOrUndefined(this.state.sections) && this.state.sections.length > 0) {
			return true;
		}
		return false;
	}

	render() {
		if (isNullOrUndefined(this.state.sections)) {
			return null;
		}

		return (
			<div className="inputContainerVertical">
				<label id="sectionsPickerInputLabel" htmlFor="TaskSectionInputRefId" className="inputLabel">Task Section</label>

				{!this.shouldDisplaySectionPicker() ?
					<label>No Sections found...</label>
					:
					<select
						id="TaskSectionInputRefId"
						placeholder="Select a task section"
						value={this.state.selectedSection?.id}
						onChange={(_e) => {
							this.setState({ selectedSection: this.state.sections.find(l => l.id == _e.target.value) })
						}}
						aria-autocomplete="none"
					>
						{this.state.sections?.map((option, _index) =>
							<option key={option.id} value={option.id}>
								{isNullOrUndefined(option.name) ? "Section 1" : option.name}
							</option>
						)}
					</select>
				}

				<CreatingNameOnlyComponent
					isDisplayingCreateView={this.state.creatingSection}
					toggleIsDisplayingCreateView={() => this.setState({ creatingSection: !this.state.creatingSection })}
					itemBeingCreatedName="Section"
					name={this.state.newSectionName}
					nameSetter={(text: string) => this.setState({ newSectionName: text })}
					nameMaxLength={100}
					nameMinLength={1}
					onCreate={this.createSection}
				/>
			</div>
		);
	}
}  
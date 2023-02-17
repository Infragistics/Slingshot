import * as React from "react";
import { isNullOrUndefined } from "../helpers/helpers";
import { CheckboxEmailAddressDetailsOptionsComponent, CheckboxEmailStringOptionsComponent } from "./CheckboxEmailOptionsComponent";

interface AssigneePickerComponentProps {
	shouldDisplay: boolean
	onChange: Function
}

interface AssigneePickerComponentState {
	loaded?: boolean,
	from?: Office.EmailAddressDetails,
	me?: Office.EmailAddressDetails,
	to?: Office.EmailAddressDetails[],
	cc?: Office.EmailAddressDetails[],

	selected: string[],
	customAdded: string[],
	inputValue: string
}

export default class AssigneePickerComponent extends React.Component<AssigneePickerComponentProps, AssigneePickerComponentState> {
	constructor(props, context) {
		super(props, context);

		this.state = {
			loaded: false,
			me: null,
			from: null,
			to: null,
			cc: null,
			selected: [],
			customAdded: [],
			inputValue: ""
		}

		this.onOptionClick = this.onOptionClick.bind(this)
		this.onCustomOptionClick = this.onCustomOptionClick.bind(this)
	}

	componentDidMount(): void {
		this.readItem()
	}

	componentDidUpdate(_prevProps: Readonly<AssigneePickerComponentProps>, _prevState: Readonly<AssigneePickerComponentState>, _snapshot?: any): void {
		if (this.state.selected.length !== _prevState.selected.length) {
			this.props.onChange(this.state.selected);
		}
	}

	readItem() {
		var callback = this.populateFieldsFromBodyResult.bind(this)
		Office.context.mailbox.item.body.getAsync(Office.CoercionType.Text, (result) => {
			callback(result, {})
		})
	}

	populateFieldsFromBodyResult(_result: any, stateUpdate: AssigneePickerComponentState) {
		var item = Office.context.mailbox.item

		var myEmail = Office.context.mailbox.userProfile.emailAddress
		var myName = Office.context.mailbox.userProfile.displayName

		stateUpdate.me = { displayName: myName, emailAddress: myEmail } as Office.EmailAddressDetails

		stateUpdate.selected = []
		stateUpdate.selected.push(myEmail)

		if (!isNullOrUndefined(item.from)) {
			if (item.from.emailAddress !== myEmail) {
				stateUpdate.from = item.from
			}

			stateUpdate.selected.push(item.from.emailAddress)
		}

		if (!isNullOrUndefined(item.to)) {
			if (item.to.length === 1 && item.to[0].emailAddress === myEmail) {
				// just me
			}
			else if (item.to.findIndex(x => x.emailAddress === myEmail) !== -1) {
				// to many plus me
				stateUpdate.to = []
				item.to.forEach(element => {
					if (element.emailAddress !== myEmail) {
						stateUpdate.to.push(element)
					}
				});
			}
			else {
				// to many without me
				stateUpdate.to = []
				item.to.forEach(element => {
					stateUpdate.to.push(element)
				});
			}
		}

		if (!isNullOrUndefined(item.cc) && item.cc.length > 0) {
			if (item.cc.length === 1 && item.cc[0].emailAddress === myEmail) {
				// just me
			}
			else if (item.cc.findIndex(x => x.emailAddress === myEmail) !== -1) {
				// cc many plus me
				stateUpdate.cc = []
				item.cc.forEach(element => {
					if (element.emailAddress !== myEmail) {
						stateUpdate.cc.push(element)
					}
				});
			}
			else {
				// cc many without me
				stateUpdate.cc = []
				item.cc.forEach(element => {
					stateUpdate.cc.push(element)
				});
			}
		}

		stateUpdate.loaded = true

		this.setState(stateUpdate)
	}

	onOptionClick(email: string, checked: boolean) {
		var selected;

		//add
		if (checked) {
			// only if not already added
			if (this.state.selected.findIndex((e) => e === email) === -1) {
				selected = [...this.state.selected, email]

				this.setState({ selected })
				this.props.onChange(selected)
			}

		}
		//remove
		else {
			selected = this.state.selected.filter(function (e) { return e !== email })
			// only update if we actually removed something
			if (selected.length !== this.state.selected.length) {
				this.setState({ selected })
				this.props.onChange(selected)
			}
		}
	}

	onCustomOptionClick(email: string, checked: boolean) {
		if (!checked) {
			var selected = this.state.selected.filter(function (e) { return e !== email })
			var customAdded = this.state.customAdded.filter(function (e) { return e !== email })

			this.setState({ selected, customAdded })
			this.props.onChange(selected)
		}
	}

	render() {
		if (this.props.shouldDisplay || !this.state.loaded) {
			return null;
		}

		return (
			<div className="inputContainerVertical">
				<h3>Who should be assigned?</h3>
				<div className="inputContainerVertical">
					<CheckboxEmailAddressDetailsOptionsComponent key="Me" identifier="Me" title="Me" emailAddressDetails={[this.state.me]} defaultChecked={true} displayEmail={false} onClick={this.onOptionClick} />
					<CheckboxEmailAddressDetailsOptionsComponent key="From" identifier="From" title="From" emailAddressDetails={[this.state.from]} defaultChecked={true} displayEmail={false} onClick={this.onOptionClick} />
					<CheckboxEmailAddressDetailsOptionsComponent key="To" identifier="To" title="To" emailAddressDetails={this.state.to} defaultChecked={false} displayEmail={false} onClick={this.onOptionClick} />
					<CheckboxEmailAddressDetailsOptionsComponent key="CC" identifier="CC" title="CC" emailAddressDetails={this.state.cc} defaultChecked={false} displayEmail={false} onClick={this.onOptionClick} />

					<label key="additional_emails_label" htmlFor="additionalEmailsInputRef">
						Assign more by email
					</label>
					<input
						id="additionalEmailsInputRef"
						key="additional_emails_input"
						type="email"
						placeholder="Invite by email..."
						value={this.state.inputValue}
						onChange={(_e) => this.setState({ inputValue: _e.currentTarget.value })}
						onKeyDownCapture={(_e) => {
							if (_e.keyCode === 13) {
								let email = _e.currentTarget.value
								if (this.state.customAdded.findIndex((e) => e === email) === -1) {
									this.setState({ customAdded: [...this.state.customAdded, _e.currentTarget.value], selected: [...this.state.selected, _e.currentTarget.value], inputValue: "" })
									window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
								}
								else {
									this.setState({ inputValue: "" })
								}
							}
						}}
					/>
					<CheckboxEmailStringOptionsComponent key="Additional" identifier="Additional" title={null} emails={this.state.customAdded} defaultChecked={true} displayEmail={true} onClick={this.onCustomOptionClick} />
				</div>
			</div>
		);
	}
}  
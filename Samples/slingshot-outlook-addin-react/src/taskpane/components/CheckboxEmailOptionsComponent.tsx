import * as React from "react";
import { isNullOrUndefined, isNullOrUndefinedOrEmptyString } from "../helpers/helpers";

function combineNameAndEmail(name: string, email: string) {
	if (isNullOrUndefinedOrEmptyString(name)) {
		return email
	}
	else {
		return name + ", " + email
	}
}

export interface CheckboxEmailOptionComponentProps {
	identifier: string;
	name: string;
	email: string;
	defaultChecked: boolean;
	displayEmail: boolean;
	onClick: (email: string, checked: boolean) => void;
}

export const CheckboxEmailOptionComponent: React.FC<CheckboxEmailOptionComponentProps> = (p) => {
	const {
		identifier,
		name,
		email,
		defaultChecked,
		displayEmail,
		onClick
	} = p;

	if (isNullOrUndefinedOrEmptyString(email)) {
		return null
	}

	return (
		<div
			className="inputContainerHorizontal checkboxOption"
			title={email}
			key={identifier + "_container"}
		>
			<input
				type="checkbox"
				id={identifier + "_item"}
				value={email}
				defaultChecked={defaultChecked}
				onClick={(_e) => onClick(email, _e.currentTarget.checked)}
			/>
			<label
				htmlFor={identifier + "_item"}
			>
				{displayEmail ? combineNameAndEmail(name, email) : name}
			</label>
		</div>
	);

}

export interface CheckboxEmailAddressDetailsOptionsComponentProps {
	identifier: string;
	title: string;
	emailAddressDetails: Office.EmailAddressDetails[];
	defaultChecked: boolean;
	displayEmail: boolean;
	onClick: (email: string, checked: boolean) => void;
}

export const CheckboxEmailAddressDetailsOptionsComponent: React.FC<CheckboxEmailAddressDetailsOptionsComponentProps> = (p) => {
	const {
		identifier,
		title,
		emailAddressDetails,
		defaultChecked,
		displayEmail,
		onClick
	} = p;

	if (isNullOrUndefined(emailAddressDetails) || emailAddressDetails.length == 0 || isNullOrUndefined(emailAddressDetails[0])) {
		return null
	}

	return (
		<div className="inputContainerVertical" key={identifier}>
			<label>{title}</label>
			{emailAddressDetails.map((_address, _index) => {
				return <CheckboxEmailOptionComponent
					key={"inputRef" + identifier + _address.emailAddress + _index}
					identifier={"inputRef" + identifier + _address.emailAddress + _index}
					name={_address.displayName}
					email={_address.emailAddress}
					defaultChecked={defaultChecked}
					displayEmail={displayEmail}
					onClick={onClick}
				/>
			})}
		</div>
	);

}


export interface CheckboxEmailStringOptionsComponentProps {
	identifier: string;
	title: string;
	emails: string[];
	defaultChecked: boolean;
	displayEmail: boolean;
	onClick: (email: string, checked: boolean) => void;
}

export const CheckboxEmailStringOptionsComponent: React.FC<CheckboxEmailStringOptionsComponentProps> = (p) => {
	const {
		identifier,
		title,
		emails,
		defaultChecked,
		displayEmail,
		onClick
	} = p;

	if (isNullOrUndefined(emails) || emails.length == 0) {
		return null
	}

	return (
		<div className="inputContainerVertical" key={identifier}>
			<label>{title}</label>
			{emails.map((_email, _index) => {
				return <CheckboxEmailOptionComponent
					key={"inputRef" + identifier + _email + _index}
					identifier={"inputRef" + identifier + _email + _index}
					name={null}
					email={_email}
					defaultChecked={defaultChecked}
					displayEmail={displayEmail}
					onClick={onClick}
				/>
			})}
		</div>
	);

}
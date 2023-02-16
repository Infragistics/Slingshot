import * as React from "react";
import { isNullOrUndefined, isValidName } from "../helpers/helpers";

interface CreatingNameOnlyComponentProps {
	isDisplayingCreateView: boolean;
	toggleIsDisplayingCreateView: Function;
	itemBeingCreatedName: string;
	name: string;
	nameSetter: Function;
	nameMinLength: number;
	nameMaxLength: number;
	onCreate: Function;
}

export const CreatingNameOnlyComponent: React.FC<CreatingNameOnlyComponentProps> = (p) => {

	const {
		isDisplayingCreateView,
		toggleIsDisplayingCreateView,
		itemBeingCreatedName,
		name,
		nameSetter,
		nameMinLength,
		nameMaxLength,
		onCreate
	} = p;

	return (
		<div className="inputContainerHorizontal">
			{
				isDisplayingCreateView ?
					<div className="inputContainerVertical">
						<input
							value={isNullOrUndefined(name) ? "" : name}
							required
							minLength={nameMinLength}
							maxLength={nameMaxLength}
							placeholder="Enter a name"
							onChange={(_e) => nameSetter(_e.target.value)}
						/>
					</div>
					: null
			}
			{
				isDisplayingCreateView ?
					<button
						type="button"
						title="Create"
						onClick={() => {
							toggleIsDisplayingCreateView()
							onCreate()
						}}
						disabled={!isValidName(name, nameMinLength, nameMaxLength)}
					>
						{"Create"}
					</button>
					:
					<button
						type="submit"
						className="fullWidth"
						title={itemBeingCreatedName}
						disabled={isDisplayingCreateView}
						onClick={() => toggleIsDisplayingCreateView()}
					>
						{"Add New " + itemBeingCreatedName}
					</button>
			}
		</div>
	);

};

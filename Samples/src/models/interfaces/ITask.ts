import { IAssigneeInfo } from "./IAssigneeInfo";
import { IDocumentInfo } from "./IDocumentInfo";

export interface ITask {
    name?: string,
	description?: string,
	status?: string,
	priority?: string,
	startDate?: Date,
	dueDate?: Date,
    assignees?: IAssigneeInfo[],
    taskSection?: IDocumentInfo
}
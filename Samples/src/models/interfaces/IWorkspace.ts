import { IDocumentInfo } from "./IDocumentInfo";
import { IMemberInfo } from "./IMemberInfo";
import { IProject } from "./IProject";
import { ITaskList } from "./ITaskList";

export interface IWorkspace extends IDocumentInfo {
    projects: IProject[];
    taskLists: ITaskList[];
    members: IMemberInfo[];
}
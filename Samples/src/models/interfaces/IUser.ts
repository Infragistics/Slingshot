import { IDocumentInfo } from "./IDocumentInfo";
import { IWorkspace } from "./IWorkspace";
import { IProject } from "./IProject";
import { ITaskList } from "./ITaskList";

export interface IUser extends IDocumentInfo {
    workspaces: IWorkspace[];
    projects: IProject[];
    taskLists: ITaskList[];
}